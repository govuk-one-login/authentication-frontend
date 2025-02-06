import { describe } from "mocha";
import { expect, sinon, request } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import { PATH_NAMES } from "../../../app.constants";

describe("Mfa reset with ipv", () => {
  let app: any;

  before(async () => {
    process.env.SUPPORT_MFA_RESET_WITH_IPV = "1";

    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");

    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals = {
          ...res.locals,
          sessionId: "tDy103saszhcxbQq0-mjdzU854",
        };

        req.session.user = {
          email: "test@test.com",
          journey: {
            nextPath: PATH_NAMES.OPEN_IN_WEB_BROWSER,
          },
        };

        next();
      });

    app = await require("../../../app").createApp();

    await request(app, (test) => test.get(PATH_NAMES.OPEN_IN_WEB_BROWSER), {
      expectAnalyticsPropertiesMatchSnapshot: false,
    }).then((res) => {
      const $ = cheerio.load(res.text);
    });
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
    delete process.env.SUPPORT_MFA_RESET_WITH_IPV;
  });

  it("should render the guidance page for when someone is trying to access via an app journey", async () => {
    await request(app, (test) =>
      test
        .get(PATH_NAMES.OPEN_IN_WEB_BROWSER)
        .expect(200)
        .expect(function (res) {
          const page = cheerio.load(res.text);
          expect(page("p").text()).to.contain("Hello world");
        })
    );
  });
});
