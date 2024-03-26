import request from "supertest";
import { after, describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import { getFrontendApiBaseUrl } from "../../../config";

describe("Integration::register create password", () => {
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
          email: "test@test.com",
          journey: {
            nextPath: PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD,
          },
        };

        next();
      });

    app = await require("../../../app").createApp();
    baseApi = getFrontendApiBaseUrl();

    request(app)
      .get(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD)
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

  it("should return create password page", (done) => {
    request(app).get(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD).expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD)
      .type("form")
      .send({
        email: "test@test.com",
        password: "test@test.com",
      })
      .expect(500, done);
  });

  it("should return validation error when password not entered", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD)
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
      .post(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD)
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
      .post(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD)
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

  it("should return validation error when no numbers present in password", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD)
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
      .post(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD)
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

  it("should return validation error when password is amongst most common passwords", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.SIGNUP_USER)
      .once()
      .reply(400, { code: 1040 });

    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD)
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

  it("should redirect to get security codes when valid password entered", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.SIGNUP_USER)
      .once()
      .reply(HTTP_STATUS_CODES.OK, {});

    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        password: "testpassword1",
        "confirm-password": "testpassword1",
      })
      .expect("Location", PATH_NAMES.GET_SECURITY_CODES)
      .expect(302, done);
  });
});
