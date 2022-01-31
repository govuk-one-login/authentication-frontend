import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";

describe("Integration::enter email", () => {
  let sandbox: sinon.SinonSandbox;
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");
    sandbox = sinon.createSandbox();
    sandbox
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

        next();
      });

    app = await require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    request(app)
      .get("/enter-email")
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

  it("should return enter email page", (done) => {
    request(app).get("/enter-email").expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post("/enter-email")
      .type("form")
      .send({
        email: "test@test.com",
      })
      .expect(500, done);
  });

  it("should return validation error when email not entered", (done) => {
    request(app)
      .post("/enter-email")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#email-error").text()).to.contains(
          "Enter your email address"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when invalid email entered", (done) => {
    request(app)
      .post("/enter-email")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test.tµrn@example.com",
      })
      .expect(function (res) {
        const page = cheerio.load(res.text);
        expect(page("#email-error").text()).to.contains(
          "Enter an email address in the correct format, like name@example.com\n"
        );
      })
      .expect(400);

    request(app)
      .post("/enter-email")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test.trnexample.com",
      })
      .expect(function (res) {
        const page = cheerio.load(res.text);
        expect(page("#email-error").text()).to.contains(
          "Enter an email address in the correct format, like name@example.com\n"
        );
      })
      .expect(400);

    request(app)
      .post("/enter-email")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test.trn@examplecom",
      })
      .expect(function (res) {
        const page = cheerio.load(res.text);
        expect(page("#email-error").text()).to.contains(
          "Enter an email address in the correct format, like name@example.com\n"
        );
      })
      .expect(400, done);
  });

  it("should redirect to /enter-password page when email address exists", (done) => {
    nock(baseApi).post("/user-exists").once().reply(200, {
      email: "test@test.com",
      sessionState: "AUTHENTICATION_REQUIRED",
    });

    request(app)
      .post("/enter-email")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect("Location", "/enter-password")
      .expect(302, done);
  });

  it("should redirect to /account-not-found when email address not found", (done) => {
    nock(baseApi)
      .post("/user-exists")
      .once()
      .reply(200, {
        email: "test@test.com",
        sessionState: "USER_NOT_FOUND",
      })
      .post("/send-notification")
      .once()
      .reply(200, { sessionState: "VERIFY_EMAIL_CODE_SENT" });

    request(app)
      .post("/enter-email")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect("Location", "/account-not-found")
      .expect(302, done);
  });

  it("should return internal server error when /user-exists API call response is 500", (done) => {
    nock(baseApi)
      .post("/user-exists")
      .once()
      .reply(500, {
        message: "Internal Server error",
      })
      .post("/send-notification")
      .once()
      .reply(200, {});

    request(app)
      .post("/enter-email")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect(500, done);
  });

  it("should redirect to /enter-password-account-exists when email address exists", (done) => {
    nock(baseApi).post("/user-exists").once().reply(200, {
      email: "test2@test2.com",
      doesUserExist: true,
      sessionState: "AUTHENTICATION_REQUIRED",
    });

    request(app)
      .post("/enter-email-create")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test2@test2.com",
      })
      .expect("Location", "/enter-password-account-exists")
      .expect(302, done);
  });

  it("should redirect to /check-your-email when email address doesn't exist", (done) => {
    nock(baseApi)
      .post("/user-exists")
      .once()
      .reply(200, {
        email: "test@test.com",
        sessionState: "USER_NOT_FOUND",
      })
      .post("/send-notification")
      .once()
      .reply(200, { sessionState: "VERIFY_EMAIL_CODE_SENT" });

    request(app)
      .post("/enter-email-create")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect("Location", "/check-your-email")
      .expect(302, done);
  });

  it("should redirect to /security-code-requested-too-many-times when request OTP more than 5 times", (done) => {
    nock(baseApi)
      .post("/user-exists")
      .once()
      .reply(200, {
        email: "test@test.com",
        sessionState: "USER_NOT_FOUND",
      })
      .post("/send-notification")
      .times(6)
      .reply(400, { sessionState: "EMAIL_MAX_CODES_SENT" });

    request(app)
      .post("/enter-email-create")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect(
        "Location",
        "/security-code-requested-too-many-times?actionType=emailMaxCodesSent"
      )
      .expect(302, done);
  });

  it("should redirect to /security-code-invalid-request when exceeded OTP request limit", (done) => {
    nock(baseApi)
      .post("/user-exists")
      .once()
      .reply(200, {
        email: "test@test.com",
        sessionState: "USER_NOT_FOUND",
      })
      .post("/send-notification")
      .once()
      .reply(400, { sessionState: "EMAIL_CODE_REQUESTS_BLOCKED" });

    request(app)
      .post("/enter-email-create")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect(
        "Location",
        "/security-code-invalid-request?actionType=emailBlocked"
      )
      .expect(302, done);
  });
});
