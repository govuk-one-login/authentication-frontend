import request from "supertest";
import { after, describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";

describe("Integration::register create password", () => {
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
        };
        next();
      });

    app = require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    request(app)
      .get("/create-password")
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

  it("should return create password page", (done) => {
    request(app).get("/create-password").expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post("/create-password")
      .type("form")
      .send({
        email: "test@test.com",
        password: "test@test.com",
      })
      .expect(500, done);
  });

  it("should return validation error when password not entered", (done) => {
    request(app)
      .post("/create-password")
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
        expect($("#confirm-password-error").text()).to.contains(
          "Re-type your password"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when passwords don't match", (done) => {
    request(app)
      .post("/create-password")
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
      .post("/create-password")
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
          "Your password must be at least 8 characters long and must include a number"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when password not valid", (done) => {
    request(app)
      .post("/create-password")
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
          "Your password must be at least 8 characters long and must include a number"
        );
      })
      .expect(400, done);
  });

  it("should redirect to enter phone number when valid password entered", (done) => {
    nock(baseApi).post("/signup").once().reply(200, {
      sessionState: "TWO_FACTOR_REQUIRED",
    });

    request(app)
      .post("/create-password")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        password: "testpassword1",
        "confirm-password": "testpassword1",
      })
      .expect("Location", "/enter-phone-number")
      .expect(302, done);
  });
});
