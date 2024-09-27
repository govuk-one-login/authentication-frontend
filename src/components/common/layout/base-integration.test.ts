import request from "supertest";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import decache from "decache";
import { PATH_NAMES } from "../../../app.constants";

describe("Integration:: base page ", () => {
  let app: any;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");
    // const channelMiddleware = require("../../../../middleware/channel-middleware");
    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

        req.session.user = {
          email: "test@test.com",
          phoneNumber: "7867",
          journey: {
            nextPath: PATH_NAMES.ENTER_MFA,
            optionalPaths: [PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION],
          },
        };

        next();
      });

    app = await require("../../../app").createApp();

    // await request(app)
    //   .get(PATH_NAMES.SIGN_IN_OR_CREATE)
    //   .then((res) => {
    //     const $ = cheerio.load(res.text);
    //   });
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it("should return the sign in or create page", async () => {
    await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE).expect(302);
  });
  it("should return the sign in or create page", async () => {
    await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE).then();
  });
});
