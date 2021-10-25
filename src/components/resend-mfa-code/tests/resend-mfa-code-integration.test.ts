import request from "supertest";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";

describe("Integration:: resend mfa code", () => {
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
        req.session.email = "test@test.com";
        req.session.phoneNumber = "******7867";

        next();
      });

    app = require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    request(app)
      .get("/resend-code")
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

  it("should return resend mfa code page", (done) => {
    request(app).get("/resend-code").expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post("/resend-code")
      .type("form")
      .send({
        code: "123456",
      })
      .expect(500, done);
  });

  it("should redirect to /enter-code when new code requested", (done) => {
    nock(baseApi).post("/mfa").once().reply(200, {
      sessionState: "MFA_SMS_CODE_SENT",
    });

    request(app)
      .post("/resend-code")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
      })
      .expect("Location", "/enter-code")
      .expect(302, done);
  });

  it("should return 500 error screen when API call fails", (done) => {
    nock(baseApi).post("/mfa").once().reply(500, {
      errorCode: "1234",
    });

    request(app)
      .post("/resend-code")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
      })
      .expect(500, done);
  });

  it("should redirect to /security-code-requested-too-many-times when request OTP more than 5 times", (done) => {
    nock(baseApi)
      .post("/mfa")
      .times(6)
      .reply(400, { sessionState: "MFA_SMS_MAX_CODES_SENT" });

    request(app)
      .post("/resend-code")
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
      .post("/mfa")
      .once()
      .reply(400, { sessionState: "MFA_CODE_REQUESTS_BLOCKED" });

    request(app)
      .post("/resend-code")
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
