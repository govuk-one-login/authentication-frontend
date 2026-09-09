import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import request from "supertest";
import * as cheerio from "cheerio";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { extractCsrfTokenAndCookies } from "../../../../test/helpers/csrf-helper.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";
import esmock from "esmock";
const { testPhoneNumber, testRedactedPhoneNumber } = commonVariables;

describe("Integration:: reset password resend-code-2fa sms", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(async () => {
    const { createApp } = await esmock(
      "../../../app.js",
      {},
      {
        "../../../middleware/session-middleware.js": {
          validateSessionMiddleware: sinon.fake(function (
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
              journey: getPermittedJourneyForPath(
                PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS
              ),
              reauthenticate: "reauth",
            };

            next();
          }),
        },
      }
    );

    process.env.SUPPORT_REAUTHENTICATION = "0";
    app = await createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    ({ token, cookies } = extractCsrfTokenAndCookies(
      await request(app).get(PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS)
    ));
  });

  beforeEach(() => {
    process.env.SUPPORT_REAUTHENTICATION = "0";
    nock.cleanAll();
  });

  after(() => {
    app = undefined;
  });

  it("should return resend code page with expected title", async () => {
    await request(app)
      .get(PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS)
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("title").text()).to.contain("Get security code");
      })
      .expect(200);
  });

  it("should return resend code page with reauth analytics properties", async () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
    await request(app)
      .get(PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS)
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("title").text()).to.contain("Get security code");
      })
      .expect(200);
  });

  it("should include the last three digits of the user's telephone number", async () => {
    await request(app)
      .get(PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS)
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($.text()).to.contain(testRedactedPhoneNumber.slice(-3));
      })
      .expect(200);
  });

  it("should state user could be locked out", async () => {
    await request(app)
      .get(PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS)
      .expect((res) => {
        const $ = cheerio.load(res.text);
        expect($.text()).to.contain("you will be locked out for 2 hours.");
      })
      .expect(200);
  });

  it("should state reauthenticating user could be signed out", async () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
    await request(app)
      .get(PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS)
      .expect((res) => {
        const $ = cheerio.load(res.text);
        expect($.text()).to.contain("you will be signed out");
      })
      .expect(200);
  });

  it("should render a back link to /reset-password-2fa-sms", async () => {
    await request(app)
      .get(PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS)
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($(".govuk-back-link").attr("href")).to.contain(
          "reset-password-2fa-sms"
        );
      })
      .expect(200);
  });

  it("should redirect to /reset-password-2fa-sms when a new code is requested", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.MFA)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    await request(app)
      .post(PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
      })
      .expect("Location", PATH_NAMES.RESET_PASSWORD_2FA_SMS)
      .expect(302);
  });

  it("should return error when csrf not present", async () => {
    await request(app)
      .post(PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS)
      .type("form")
      .send({
        code: "123456",
      })
      .expect(403);
  });

  it("should return 500 error screen when API call fails", async () => {
    nock(baseApi).post(API_ENDPOINTS.MFA).once().reply(500, {
      errorCode: "1234",
    });

    await request(app)
      .post(PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
      })
      .expect(500);
  });

  it("should redirect to cannot-use-security-code page when MFA returns indefinite international SMS block error", async () => {
    nock(baseApi).post(API_ENDPOINTS.MFA).once().reply(400, {
      code: 1092,
      message:
        "User is indefinitely blocked from sending SMS to international numbers",
    });

    await request(app)
      .post(PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
      })
      .expect("Location", PATH_NAMES.CANNOT_USE_SECURITY_CODE)
      .expect(302);
  });
});
