import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import request from "supertest";
import * as cheerio from "cheerio";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants.js";
import { ERROR_CODES } from "../../common/constants.js";
import {
  noInterventions,
  setupAccountInterventionsResponse,
} from "../../../../test/helpers/account-interventions-helpers.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";
import type { UserLoginResponse } from "../types.js";

describe("Integration::enter password", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  const ENDPOINT = "/enter-password";

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
            res.locals.clientSessionId = "gdsfsfdsgsdgsd-mjdzU854";
            res.locals.persistentSessionId = "dips-123456-abc";

            req.session.user = {
              email: "test@test.com",
              journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_PASSWORD),
            };

            next();
          }),
        },
      }
    );

    process.env.SUPPORT_REAUTHENTICATION = "0";
    app = await createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    await request(app)
      .get(ENDPOINT)
      .then((res) => {
        const $ = cheerio.load(res.text);
        token = $("[name=_csrf]").val();
        cookies = res.headers["set-cookie"];
      });
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  it("should return enter password page with sign in analytics properties", async () => {
    await request(app).get(ENDPOINT).expect(200);
  });

  it("should return error when csrf not present", async () => {
    await request(app)
      .post(ENDPOINT)
      .type("form")
      .send({
        password: "password",
      })
      .expect(403);
  });

  it("should return validation error when password not entered", async () => {
    await request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        password: "",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#password-error").text()).to.contains("Enter your password");
      })
      .expect(400);
  });

  it("should return validation error when password is incorrect", async () => {
    nock(baseApi).post(API_ENDPOINTS.LOG_IN_USER).once().reply(401);

    await request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        password: "pasasd",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#password-error").text()).to.contains(
          "The password you entered is not correct"
        );
      })
      .expect(400);
  });

  it("should redirect to /auth-code when password is correct (VTR Cl)", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.LOG_IN_USER)
      .once()
      .reply(200, {
        mfaRequired: false,
        mfaMethodType: "SMS",
        mfaMethods: buildMfaMethods({
          id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7a3a03d7",
          phoneNumber: "07123456789",
          redactedPhoneNumber: "789",
        }),
        mfaMethodVerified: true,
        passwordChangeRequired: false,
      } as UserLoginResponse);

    await request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        password: "password",
      })
      .expect("Location", PATH_NAMES.AUTH_CODE)
      .expect(302);
  });

  it("should redirect to /enter-code when password is correct (VTR Cl.Cm)", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.LOG_IN_USER)
      .once()
      .reply(200, {
        mfaRequired: true,
        mfaMethodType: "SMS",
        mfaMethods: buildMfaMethods({
          id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7a3a03d7",
          phoneNumber: "07123456789",
          redactedPhoneNumber: "789",
        }),
        mfaMethodVerified: true,
        passwordChangeRequired: false,
      } as UserLoginResponse);
    nock(baseApi).post("/mfa").once().reply(204);

    await request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        password: "password",
      })
      .expect("Location", PATH_NAMES.ENTER_MFA)
      .expect(302);
  });

  it("should redirect to /reset-password-2fa-sms when password is correct and user's MFA is set to SMS when 2FA is not required", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.LOG_IN_USER)
      .once()
      .reply(200, {
        mfaRequired: false,
        mfaMethodType: "SMS",
        mfaMethods: buildMfaMethods({
          id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7a3a03d7",
          phoneNumber: "07123456789",
          redactedPhoneNumber: "789",
        }),
        mfaMethodVerified: true,
        passwordChangeRequired: true,
      } as UserLoginResponse);

    setupAccountInterventionsResponse(baseApi, noInterventions);

    await request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        password: "password",
      })
      .expect("Location", PATH_NAMES.RESET_PASSWORD)
      .expect(302);
  });

  it("should redirect to /reset-password-2fa-sms when password is correct and user's MFA is set to SMS when 2FA is required", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.LOG_IN_USER)
      .once()
      .reply(200, {
        mfaRequired: true,
        mfaMethodType: "SMS",
        mfaMethods: buildMfaMethods({
          id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7a3a03d7",
          phoneNumber: "07123456789",
          redactedPhoneNumber: "789",
        }),
        mfaMethodVerified: true,
        passwordChangeRequired: true,
      } as UserLoginResponse);

    setupAccountInterventionsResponse(baseApi, noInterventions);

    await request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        password: "password",
      })
      .expect("Location", PATH_NAMES.RESET_PASSWORD_2FA_SMS)
      .expect(302);
  });

  it("should redirect to /account-locked from sign-in flow when incorrect password entered 5 times", async () => {
    nock(baseApi).post(API_ENDPOINTS.LOG_IN_USER).times(6).reply(400, {
      code: ERROR_CODES.INVALID_PASSWORD_MAX_ATTEMPTS_REACHED,
    });

    await request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        password: "password",
      })
      .expect("Location", PATH_NAMES.ACCOUNT_LOCKED)
      .expect(302);
  });

  it("should render lockout page when mfa returns indefinite international SMS block error", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.LOG_IN_USER)
      .once()
      .reply(200, {
        success: true,
        mfaRequired: true,
        mfaMethodVerified: true,
        mfaMethodType: "SMS",
        mfaMethods: buildMfaMethods({ redactedPhoneNumber: "1234" }),
      });

    setupAccountInterventionsResponse(baseApi, noInterventions);

    nock(baseApi).post(API_ENDPOINTS.MFA).once().reply(400, {
      code: 1092,
      message:
        "User is indefinitely blocked from sending SMS to international numbers",
    });

    const result = await request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        password: "password",
      })
      .expect(200);

    const $ = cheerio.load(result.text);
    expect($("h1").text()).to.contains("Sorry, there is a problem");
    expect($("body").text()).to.contains("Try again later");
  });

  it("should render lockout page when login returns indefinite international SMS block error", async () => {
    nock(baseApi).post(API_ENDPOINTS.LOG_IN_USER).once().reply(400, {
      code: 1092,
      message:
        "User is indefinitely blocked from sending SMS to international numbers",
    });

    setupAccountInterventionsResponse(baseApi, noInterventions);

    const result = await request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        password: "password",
      })
      .expect(200);

    const $ = cheerio.load(result.text);
    expect($("h1").text()).to.contains("Sorry, there is a problem");
    expect($("body").text()).to.contains("Try again later");
  });
});
