import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import { ERROR_CODES } from "../../common/constants";

describe("Integration:: resend mfa code", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");
    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

        req.session.user = {
          email: "test@test.com",
          phoneNumber: "7867",
          journey: {
            nextPath: PATH_NAMES.ENTER_MFA,
            optionalPaths: [PATH_NAMES.RESEND_MFA_CODE],
          },
        };

        next();
      });

    app = await require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    await request(app)
      .get(PATH_NAMES.RESEND_MFA_CODE)
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
    request(app).get(PATH_NAMES.RESEND_MFA_CODE).expect(200, done);

    it("should include the last three digits of the user's telephone number", (done) => {
      request(app)
        .get(PATH_NAMES.RESEND_MFA_CODE)
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($(".govuk-inset-text").text()).to.eq(
            "We will send a code to your phone number ending with 867"
          );
        })
        .expect(200, done);
    });
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post(PATH_NAMES.RESEND_MFA_CODE)
      .type("form")
      .send({
        code: "123456",
      })
      .expect(500, done);
  });

  it("should redirect to /enter-code when new code requested as part of sign in journey", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.MFA)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    request(app)
      .post(PATH_NAMES.RESEND_MFA_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
      })
      .expect("Location", PATH_NAMES.ENTER_MFA)
      .expect(302, done);
  });

  it("should redirect to /check-your-phone when new code requested as part of account creation journey", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.MFA)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    request(app)
      .post(PATH_NAMES.RESEND_MFA_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        isResendCodeRequest: true,
      })
      .expect("Location", PATH_NAMES.CHECK_YOUR_PHONE)
      .expect(302, done);
  });

  it("should render 'You cannot get a new security code at the moment' when OTP lockout timer cookie is active", () => {
    const testSpecificCookies = cookies + "; re=true";
    request(app)
      .get(PATH_NAMES.RESEND_MFA_CODE)
      .set("Cookie", testSpecificCookies)
      .expect((res) => {
        res.text.includes("You cannot get a new security code at the moment");
      });
  });

  it("should return 500 error screen when API call fails", (done) => {
    nock(baseApi).post(API_ENDPOINTS.MFA).once().reply(500, {
      errorCode: "1234",
    });

    request(app)
      .post(PATH_NAMES.RESEND_MFA_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
      })
      .expect(500, done);
  });

  it("should redirect to /security-code-requested-too-many-times when request OTP more than 5 times", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.MFA)
      .times(6)
      .reply(400, { code: ERROR_CODES.MFA_SMS_MAX_CODES_SENT });

    request(app)
      .post(PATH_NAMES.RESEND_MFA_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
      })
      .expect(
        "Location",
        "/security-code-requested-too-many-times?actionType=mfaMaxCodesSent"
      )
      .expect(302, done);
  });

  it("should redirect to /security-code-invalid-request when exceeded OTP request limit", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.MFA)
      .once()
      .reply(400, { code: ERROR_CODES.MFA_CODE_REQUESTS_BLOCKED });

    request(app)
      .post(PATH_NAMES.RESEND_MFA_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
      })
      .expect(
        "Location",
        "/security-code-invalid-request?actionType=mfaBlocked"
      )
      .expect(302, done);
  });
});
