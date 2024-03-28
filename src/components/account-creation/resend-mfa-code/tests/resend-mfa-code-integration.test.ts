import request from "supertest";
import { describe } from "mocha";
import { sinon } from "../../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../../app.constants";
import { getFrontendApiBaseUrl } from "../../../../config";

describe("Integration:: resend SMS mfa code (account creation variant)", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(async () => {
    decache("../../../../app");
    decache("../../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../../middleware/session-middleware");
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

    app = await require("../../../../app").createApp();
    baseApi = getFrontendApiBaseUrl();

    await request(app)
      .get(PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION)
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

  it("should return resend mfa code page", (done) => {
    request(app)
      .get(PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION)
      .expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post(PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION)
      .type("form")
      .send({
        code: "123456",
      })
      .expect(500, done);
  });

  it("should redirect to /check-your-phone when new code requested", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.SEND_NOTIFICATION)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    request(app)
      .post(PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        isResendCodeRequest: true,
      })
      .expect("Location", PATH_NAMES.CHECK_YOUR_PHONE)
      .expect(302, done);
  });

  it("should return 500 error screen when API call fails", (done) => {
    nock(baseApi).post(API_ENDPOINTS.SEND_NOTIFICATION).once().reply(500, {
      errorCode: "1234",
    });

    request(app)
      .post(PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
      })
      .expect(500, done);
  });
});
