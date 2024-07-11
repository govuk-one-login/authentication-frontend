import request from "supertest";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils";
import decache from "decache";

import cheerio from "cheerio";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import nock = require("nock");
import {
  noInterventions,
  setupAccountInterventionsResponse,
} from "../../../../test/helpers/account-interventions-helpers";

describe("Integration::reset password check email ", () => {
  let app: any;
  let baseApi: string;
  let token: string | string[];
  let cookies: string;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");

    process.env.SUPPORT_2FA_B4_PASSWORD_RESET = "1";
    process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "1";

    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        req.session.user = {
          email: "test@test.com",
          journey: {
            nextPath: PATH_NAMES.ENTER_PASSWORD,
            optionalPaths: [PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL],
          },
        };
        req.session.user.enterEmailMfaType = "AUTH_APP";
        next();
      });

    app = await require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    nock(baseApi).post("/reset-password-request").once().reply(204);

    await request(app)
      .get(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL)
      .then((res) => {
        const $ = cheerio.load(res.text);
        token = $("[name=_csrf]").val();
        cookies = res.headers["set-cookie"];
      });
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it("should return reset password check email page", (done) => {
    nock(baseApi).post("/reset-password-request").once().reply(204);
    request(app).get("/reset-password-check-email").expect(200, done);
  });

  it("should redirect to /reset-password-2fa-auth-app if user's 2FA is set to AUTH_APP", (done) => {
    nock(baseApi)
      .persist()
      .post(API_ENDPOINTS.VERIFY_CODE)
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {});

    setupAccountInterventionsResponse(baseApi, noInterventions);

    request(app)
      .post("/reset-password-check-email")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123456",
      })
      .expect("Location", PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP)
      .expect(302, done);
  });
});
