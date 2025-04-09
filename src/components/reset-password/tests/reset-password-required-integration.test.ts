import { describe } from "mocha";
import { expect, request, sinon } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import * as cheerio from "cheerio";
import { MFA_METHOD_TYPE, PATH_NAMES } from "../../../app.constants.js";
import decache from "decache";
import {
  noInterventions,
  setupAccountInterventionsResponse,
} from "../../../../test/helpers/account-interventions-helpers.js";
import { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";

describe("Integration::reset password required", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  const ENDPOINT = PATH_NAMES.RESET_PASSWORD_REQUIRED;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = await import(
      "../../../middleware/session-middleware"
    );

    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (
        req: Request,
        res: Response,
        next: NextFunction
      ): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        req.session.user = {
          email: "test@test.com",
          mfaMethods: buildMfaMethods({ phoneNumber: "7867" }),
          journey: getPermittedJourneyForPath(ENDPOINT),
          isAuthenticated: true,
          isAccountPartCreated: false,
          accountRecoveryVerifiedMfaType: MFA_METHOD_TYPE.SMS,
        };

        next();
      });
    app = await (await import("../../../app")).createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;
    setupAccountInterventionsResponse(baseApi, noInterventions);

    await request(app, (test) => test.get(ENDPOINT), {
      expectAnalyticsPropertiesMatchSnapshot: false,
    }).then((res) => {
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

  it("should return reset password page", async () => {
    setupAccountInterventionsResponse(baseApi, noInterventions);

    await request(app, (test) => test.get(ENDPOINT).expect(200));
  });

  it("should return error when csrf not present", async () => {
    await request(app, (test) =>
      test
        .post(ENDPOINT)
        .type("form")
        .send({
          password: "password",
        })
        .expect(403)
    );
  });

  it("should return validation error when password not entered", async () => {
    await request(app, (test) =>
      test
        .post(ENDPOINT)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          password: "",
          "confirm-password": "",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#password-error").text()).to.contains(
            "Enter your password"
          );
        })
        .expect(400)
    );
  });

  it("should return validation error when passwords don't match", async () => {
    await request(app, (test) =>
      test
        .post(ENDPOINT)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          password: "sadsadasd33da",
          "confirm-password": "sdnnsad99d",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#confirm-password-error").text()).to.contains(
            "Enter the same password in both fields"
          );
        })
        .expect(400)
    );
  });

  it("should return validation error when password less than 8 characters", async () => {
    await request(app, (test) =>
      test
        .post(ENDPOINT)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          password: "dad",
          "confirm-password": "",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#password-error").text()).to.contains(
            "Your password must be at least 8 characters long and must include letters and numbers"
          );
        })
        .expect(400)
    );
  });

  it("should return validation error when password is amongst most common passwords", async () => {
    nock(baseApi).post("/reset-password").once().reply(400, { code: 1040 });

    await request(app, (test) =>
      test
        .post(ENDPOINT)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          password: "password123",
          "confirm-password": "password123",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#password-error").text()).to.contains(
            "Enter a stronger password. Do not use very common passwords, such as ‘password’ or a sequence of numbers."
          );
        })
        .expect(400)
    );
  });

  it("should return error when new password is the same as existing password", async () => {
    nock(baseApi).post("/reset-password").once().reply(400, { code: 1024 });

    await request(app, (test) =>
      test
        .post(ENDPOINT)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          password: "p@ssw0rd-123",
          "confirm-password": "p@ssw0rd-123",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#password-error").text()).to.contains(
            "You are already using that password. Enter a different password"
          );
        })
        .expect(400)
    );
  });

  it("should return validation error when no numbers present in password", async () => {
    await request(app, (test) =>
      test
        .post(ENDPOINT)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          password: "testpassword",
          "confirm-password": "testpassword",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#password-error").text()).to.contains(
            "Your password must be at least 8 characters long and must include letters and numbers"
          );
        })
        .expect(400)
    );
  });

  it("should return validation error when password all numeric", async () => {
    await request(app, (test) =>
      test
        .post(ENDPOINT)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          password: "222222222222222",
          "confirm-password": "222222222222222",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#password-error").text()).to.contains(
            "Your password must be at least 8 characters long and must include letters and numbers"
          );
        })
        .expect(400)
    );
  });

  it("should redirect to /auth-code when valid password entered", async () => {
    nock(baseApi).post("/reset-password").once().reply(204);
    nock(baseApi).post("/login").once().reply(200);
    nock(baseApi).post("/mfa").once().reply(204);

    await request(app, (test) =>
      test
        .post(ENDPOINT)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          password: "Testpassword1",
          "confirm-password": "Testpassword1",
        })
        .expect("Location", PATH_NAMES.AUTH_CODE)
        .expect(302)
    );
  });
});
