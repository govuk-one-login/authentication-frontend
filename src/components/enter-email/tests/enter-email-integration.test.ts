import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import * as sessionMiddleware from "../../../middleware/session-middleware";

describe("Integration::enter email", () => {
  let sandbox: sinon.SinonSandbox;
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(() => {
    sandbox = sinon.createSandbox();
    sandbox
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        req.session.user = {
          id: "12sadjk",
          scope: "openid",
        };
        next();
      });

    app = require("../../../app").createApp();
    baseApi = process.env.API_BASE_URL;

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
        email: "INVALID",
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
      doesUserExist: true,
      sessionState: "USER_FOUND",
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

  it("should redirect to /check-your-email when email address not found", (done) => {
    nock(baseApi)
      .post("/user-exists")
      .once()
      .reply(200, {
        email: "test@test.com",
        doesUserExist: false,
        sessionState: "USER_NOT_FOUND",
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
      .expect("Location", "/check-your-email")
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
});
