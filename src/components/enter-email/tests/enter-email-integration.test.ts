import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants";

describe("Integration::enter email", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");

    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

        req.session.user = {
          journey: {
            nextPath: PATH_NAMES.ENTER_EMAIL_SIGN_IN,
            optionalPaths: [PATH_NAMES.SIGN_IN_OR_CREATE],
          },
        };

        next();
      });

    app = await require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    request(app)
      .get(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
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

  it("should return enter email page", (done) => {
    request(app).get(PATH_NAMES.ENTER_EMAIL_SIGN_IN).expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
      .type("form")
      .send({
        email: "test@test.com",
      })
      .expect(500, done);
  });

  it("should return validation error when email not entered", (done) => {
    request(app)
      .post(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
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
      .post(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
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
      .post(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
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
      .post(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
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
    nock(baseApi).post(API_ENDPOINTS.USER_EXISTS).once().reply(200, {
      email: "test@test.com",
      userExists: true,
    });

    request(app)
      .post(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect("Location", PATH_NAMES.ENTER_PASSWORD)
      .expect(302, done);
  });

  it("should redirect to /account-not-found when email address not found", (done) => {
    nock(baseApi).post(API_ENDPOINTS.USER_EXISTS).once().reply(200, {
      email: "test@test.com",
      userExists: false,
    });

    request(app)
      .post(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect("Location", PATH_NAMES.ACCOUNT_NOT_FOUND)
      .expect(302, done);
  });

  it("should return internal server error when /user-exists API call response is 500", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.USER_EXISTS)
      .once()
      .reply(500, {
        message: "Internal Server error",
      })
      .post("/send-notification")
      .once()
      .reply(200, {});

    request(app)
      .post(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect(500, done);
  });
});
