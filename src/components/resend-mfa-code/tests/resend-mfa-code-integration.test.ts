import { describe } from "mocha";
import { expect, request, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import { ERROR_CODES } from "../../common/constants";
import { commonVariables } from "../../../../test/helpers/common-test-variables";
import { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper";
const { testPhoneNumber, testRedactedPhoneNumber } = commonVariables;

describe("Integration:: resend mfa code", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;
  let validateSessionStub: sinon.SinonStub<any[], any>;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");
    validateSessionStub = sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (
        req: Request,
        res: Response,
        next: NextFunction
      ): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

        req.session.user = {
          email: "test@test.com",
          mfaMethods: buildMfaMethods({
            phoneNumber: testPhoneNumber,
            redactedPhoneNumber: testRedactedPhoneNumber,
          }),
          journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_MFA),
          reauthenticate: "reauth",
        };

        next();
      });

    process.env.SUPPORT_REAUTHENTICATION = "0";
    app = await require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    await request(app, (test) => test.get(PATH_NAMES.RESEND_MFA_CODE)).then(
      (res) => {
        const $ = cheerio.load(res.text);
        token = $("[name=_csrf]").val();
        cookies = res.headers["set-cookie"];
      }
    );
  });

  beforeEach(() => {
    process.env.SUPPORT_REAUTHENTICATION = "0";
    nock.cleanAll();
  });

  afterEach(() => {
    validateSessionStub.restore();
  });

  after(() => {
    validateSessionStub.restore();
    app = undefined;
  });

  it("should return resend mfa code page with sign in analytics properties", async () => {
    await request(app, (test) =>
      test
        .get(PATH_NAMES.RESEND_MFA_CODE)
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("title").text()).to.contain("Get security code");
        })
        .expect(200)
    );
  });

  it("should return resend mfa code page with reauth analytics properties", async () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
    await request(app, (test) =>
      test
        .get(PATH_NAMES.RESEND_MFA_CODE)
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("title").text()).to.contain("Get security code");
        })
        .expect(200)
    );
  });

  it("should include the last three digits of the user's telephone number", async () => {
    await request(app, (test) =>
      test
        .get(PATH_NAMES.RESEND_MFA_CODE)
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($.text()).to.contain(testRedactedPhoneNumber.slice(-3));
        })
        .expect(200)
    );
  });

  it("should state user could be locked out", async () => {
    await request(app, (test) =>
      test
        .get(PATH_NAMES.RESEND_MFA_CODE)
        .expect((res) => {
          const $ = cheerio.load(res.text);
          expect($.text()).to.contain("you will be locked out for 2 hours.");
        })
        .expect(200)
    );
  });

  it("should state reauthenticating user could be logged out", async () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
    await request(app, (test) =>
      test
        .get(PATH_NAMES.RESEND_MFA_CODE)
        .expect((res) => {
          const $ = cheerio.load(res.text);
          expect($.text()).to.contain("you will be signed out");
        })
        .expect(200)
    );
  });

  it("should return error when csrf not present", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESEND_MFA_CODE)
        .type("form")
        .send({
          code: "123456",
        })
        .expect(403)
    );
  });

  it("should redirect to /enter-code when new code requested as part of sign in journey", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.MFA)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESEND_MFA_CODE)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
        })
        .expect("Location", PATH_NAMES.ENTER_MFA)
        .expect(302)
    );
  });

  it("should redirect to /check-your-phone when new code requested as part of account creation journey", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.MFA)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESEND_MFA_CODE)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          isResendCodeRequest: true,
        })
        .expect("Location", PATH_NAMES.CHECK_YOUR_PHONE)
        .expect(302)
    );
  });

  it("should render 'You cannot get a new security code at the moment' when OTP lockout timer cookie is active", async () => {
    const testSpecificCookies = cookies + "; re=true";
    await request(app, (test) =>
      test
        .get(PATH_NAMES.RESEND_MFA_CODE)
        .set("Cookie", testSpecificCookies)
        .expect((res) => {
          res.text.includes("You cannot get a new security code at the moment");
        })
    );
  });

  it("should return 500 error screen when API call fails", async () => {
    nock(baseApi).post(API_ENDPOINTS.MFA).once().reply(500, {
      errorCode: "1234",
    });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESEND_MFA_CODE)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
        })
        .expect(500)
    );
  });

  it("should return 400 error screen when API call fails", async () => {
    nock(baseApi).post(API_ENDPOINTS.MFA).once().reply(400, {
      errorCode: "1015",
    });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESEND_MFA_CODE)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
        })
        .expect(500)
    );
  });

  it("should redirect to /security-code-requested-too-many-times when request OTP more than 5 times", async () => {
    process.env.SUPPORT_REAUTHENTICATION = "0";

    nock(baseApi)
      .post(API_ENDPOINTS.MFA)
      .times(6)
      .reply(400, { code: ERROR_CODES.MFA_SMS_MAX_CODES_SENT });

    request(app, (test) =>
      test
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
        .expect(302)
    );
  });

  it("should redirect to /security-code-invalid-request when exceeded OTP request limit", async () => {
    process.env.SUPPORT_REAUTHENTICATION = "0";

    nock(baseApi)
      .post(API_ENDPOINTS.MFA)
      .once()
      .reply(400, { code: ERROR_CODES.MFA_CODE_REQUESTS_BLOCKED });

    request(app, (test) =>
      test
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
        .expect(302)
    );
  });
});
