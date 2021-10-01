import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";

describe("Integration:: enter mfa", () => {
  let sandbox: sinon.SinonSandbox;
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(() => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");
    sandbox = sinon.createSandbox();
    sandbox
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        req.session.user = {
          email: "test@test.com",
          phoneNumber: "******7867",
        };
        next();
      });

    app = require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    request(app)
      .get("/enter-code")
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
    sandbox.restore();
    app = undefined;
  });

  it("should return check your phone page", (done) => {
    request(app).get("/enter-code").expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post("/enter-code")
      .type("form")
      .send({
        code: "123456",
      })
      .expect(500, done);
  });

  it("should return validation error when code not entered", (done) => {
    request(app)
      .post("/enter-code")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains("Enter the security code");
      })
      .expect(400, done);
  });

  it("should return validation error when code is less than 6 characters", (done) => {
    request(app)
      .post("/enter-code")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "2",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "Enter the security code using only 6 digits"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when code is greater than 6 characters", (done) => {
    request(app)
      .post("/enter-code")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "1234567",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "Enter the security code using only 6 digits"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when code entered contains letters", (done) => {
    request(app)
      .post("/enter-code")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "12ert-",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "Enter the security code using only 6 digits"
        );
      })
      .expect(400, done);
  });

  it("should redirect to /auth-code when valid code entered", (done) => {
    nock(baseApi).post("/verify-code").once().reply(200, {
      sessionState: "MFA_CODE_VERIFIED",
    });

    request(app)
      .post("/enter-code")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123456",
      })
      .expect("Location", "/auth-code")
      .expect(302, done);
  });

  it("should return validation error when incorrect code entered", (done) => {
    nock(baseApi).post("/verify-code").once().reply(400, {
      sessionState: "MFA_CODE_NOT_VALID",
    });

    request(app)
      .post("/enter-code")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123455",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          " The security code you entered is not correct, or may have expired, try entering it again or request a new security code."
        );
      })
      .expect(400, done);
  });

  it("should redirect to security code expired when incorrect code has been entered 5 times", (done) => {
    nock(baseApi).post("/verify-code").times(6).reply(400, {
      sessionState: "MFA_CODE_MAX_RETRIES_REACHED",
      success: false,
    });

    request(app)
      .post("/enter-code")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123455",
      })
      .expect("Location", "/security-code-invalid")
      .expect(302, done);
  });
});
