import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import * as cheerio from "cheerio";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import decache from "decache";
import nock = require("nock");

describe("Integration::2fa auth app (in reset password flow)", () => {
  let app: any;
  let baseApi: string;
  let token: string | string[];
  let cookies: string;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");

    process.env.SUPPORT_2FA_B4_PASSWORD_RESET = "1";

    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        req.session.user = {
          email: "test@test.com",
          journey: {
            nextPath: PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP,
          },
        };

        next();
      });

    app = await require("../../../app").createApp();

    baseApi = process.env.FRONTEND_API_BASE_URL;

    nock(baseApi).persist().post("/mfa").reply(204);

    request(app)
      .get(PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP)
      .end((err, res) => {
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

  it("should return updated check auth app page", (done) => {
    nock(baseApi).persist().post("/mfa").reply(204);
    request(app)
      .get(PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP)
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#updatedHeading").length).to.eq(1);
      })
      .expect(200, done);
  });

  it("should redirect to reset password step when valid sms code is entered", (done) => {
    nock(baseApi)
      .persist()
      .post(API_ENDPOINTS.VERIFY_MFA_CODE)
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {});

    request(app)
      .post(PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123456",
      })
      .expect("Location", PATH_NAMES.RESET_PASSWORD)
      .expect(302, done);
  });
});
