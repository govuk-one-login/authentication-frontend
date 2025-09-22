import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import * as cheerio from "cheerio";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants.js";
import nock from "nock";
import request from "supertest";
import { ERROR_CODES } from "../../common/constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";

describe("Integration::reset password check email ", () => {
  let app: any;
  let baseApi: string;
  let token: string | string[];
  let cookies: string;

  const sessionEmail = "test@test.com";

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
              email: sessionEmail,
              journey: getPermittedJourneyForPath(
                PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL
              ),
              mfaMethods: buildMfaMethods({
                redactedPhoneNumber: "123",
                id: "test-id",
              }),
              activeMfaMethodId: "test-id",
            };
            req.session.user.mfaMethodType = "SMS";
            next();
          }),
        },
      }
    );

    process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "0";

    app = await createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    nock(baseApi)
      .post(API_ENDPOINTS.RESET_PASSWORD_REQUEST)
      .once()
      .reply(200, { mfaMethods: [] });

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

  it("should return reset password check email page", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.RESET_PASSWORD_REQUEST)
      .once()
      .reply(200, {
        mfaMethods: buildMfaMethods({
          redactedPhoneNumber: "123",
          id: "test-id",
        }),
      });
    await request(app).get(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL).expect(200);
  });

  it("should return error page when 6 password reset codes requested", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.RESET_PASSWORD_REQUEST)
      .times(6)
      .reply(400, { code: 1022 });

    await request(app)
      .get(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL)
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($(".govuk-heading-l").text()).to.contains(
          "You asked to resend the security code too many times"
        );
      })
      .expect(200);
  });

  it("should return 2hr error page when 6 incorrect codes entered and flag is turned on", async () => {
    nock(baseApi).post(API_ENDPOINTS.RESET_PASSWORD_REQUEST).reply(400, {
      code: ERROR_CODES.ENTERED_INVALID_PASSWORD_RESET_CODE_MAX_TIMES,
    });

    await request(app)
      .get(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL)
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($(".govuk-heading-l").text()).to.contains(
          "You cannot sign in at the moment"
        );
        expect($(".govuk-body").text()).to.contains("Wait for 2 hours");
      })
      .expect(200);
  });

  it("should return error page when blocked from requesting codes", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.RESET_PASSWORD_REQUEST)
      .once()
      .reply(400, { code: 1023 });

    await request(app)
      .get(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL)
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($(".govuk-heading-l").text()).to.contains(
          "You cannot sign in at the moment"
        );
      })
      .expect(200);
  });

  it("should redisplay page with error", async () => {
    nock(baseApi).post(API_ENDPOINTS.VERIFY_CODE).reply(400, { code: 1021 });

    await request(app)
      .post(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123456",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contain(
          "The code you entered is not correct"
        );
        expect(res.text).to.contain(sessionEmail);
      })
      .expect(400);
  });

  it("should validate the input", async () => {
    await request(app)
      .post(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contain("Enter the code");
        expect(res.text).to.contain(sessionEmail);
      })
      .expect(400);
  });

  it("should return internal server error when /reset-password-request API call response is 500", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.RESET_PASSWORD_REQUEST)
      .once()
      .reply(500, {});
    await request(app).get(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL).expect(500);
  });

  it("should redirect to /reset-password if code is correct", async () => {
    nock(baseApi)
      .persist()
      .post(API_ENDPOINTS.VERIFY_CODE)
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {});
    nock(baseApi)
      .persist()
      .post(API_ENDPOINTS.MFA)
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {});

    await request(app)
      .post(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123456",
      })
      .expect("Location", PATH_NAMES.RESET_PASSWORD_2FA_SMS)
      .expect(302);
  });

  [
    [
      ERROR_CODES.MFA_CODE_REQUESTS_BLOCKED,
      "you asked to resend the security code too many times",
    ],
    [
      ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES,
      "you entered the wrong security code too many times",
    ],
  ].forEach(([errorCode, expectedString]) => {
    it(`should render expected error message when verifying email OTP results in ${errorCode} error code`, async () => {
      nock(baseApi)
        .persist()
        .post(API_ENDPOINTS.VERIFY_CODE)
        .reply(HTTP_STATUS_CODES.BAD_REQUEST, { code: errorCode });

      await request(app)
        .post(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123456",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($(".govuk-body").text()).to.contains(expectedString);
        })
        .expect(200);
    });

    it(`should render expected error message when sending SMS OTP code results in ${errorCode} error code`, async () => {
      nock(baseApi)
        .persist()
        .post(API_ENDPOINTS.VERIFY_CODE)
        .reply(HTTP_STATUS_CODES.NO_CONTENT, {});
      nock(baseApi).persist().post(API_ENDPOINTS.MFA).reply(400, {
        code: errorCode,
      });

      await request(app)
        .post(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123456",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($(".govuk-body").text()).to.contains(expectedString);
        })
        .expect(200);
    });
  });
});
