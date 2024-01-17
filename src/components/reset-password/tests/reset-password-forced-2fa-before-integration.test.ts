import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import { MFA_METHOD_TYPE, PATH_NAMES } from "../../../app.constants";
import decache from "decache";

describe("Integration::reset password (in 2FA Before Reset Password flow)", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  const ENDPOINT = "/reset-password";

  before(async () => {
    process.env.SUPPORT_2FA_B4_PASSWORD_RESET = "1";
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
            nextPath: PATH_NAMES.RESET_PASSWORD,
          },
          isAuthenticated: true,
          isAccountPartCreated: false,
          accountRecoveryVerifiedMfaType: MFA_METHOD_TYPE.SMS,
        };

        next();
      });
    app = await require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    request(app)
      .get(ENDPOINT)
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

  it("should return reset password page", (done) => {
    request(app).get(ENDPOINT).expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post(ENDPOINT)
      .type("form")
      .send({
        password: "password",
      })
      .expect(500, done);
  });

  it("should return validation error when password not entered", (done) => {
    request(app)
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
        expect($("#password-error").text()).to.contains("Enter your password");
      })
      .expect(400, done);
  });

  it("should return validation error when passwords don't match", (done) => {
    request(app)
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
      .expect(400, done);
  });

  it("should return validation error when password less than 8 characters", (done) => {
    request(app)
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
      .expect(400, done);
  });

  it("should return validation error when password is amongst most common passwords", (done) => {
    nock(baseApi).post("/reset-password").once().reply(400, { code: 1040 });

    request(app)
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
      .expect(400, done);
  });

  it("should return error when new password is the same as existing password", (done) => {
    nock(baseApi).post("/reset-password").once().reply(400, { code: 1024 });

    request(app)
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
      .expect(400, done);
  });

  it("should return validation error when no numbers present in password", (done) => {
    request(app)
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
      .expect(400, done);
  });

  it("should return validation error when password all numeric", (done) => {
    request(app)
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
      .expect(400, done);
  });

  it("should redirect to /auth-code when valid password entered", (done) => {
    nock(baseApi).post("/reset-password").once().reply(204);
    nock(baseApi).post("/login").once().reply(200);
    nock(baseApi).post("/mfa").once().reply(204);

    request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        password: "Testpassword1",
        "confirm-password": "Testpassword1",
      })
      .expect("Location", PATH_NAMES.AUTH_CODE)
      .expect(302, done);
  });
});
