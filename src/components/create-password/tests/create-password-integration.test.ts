import { after, describe } from "mocha";
import { expect, sinon, request } from "../../../../test/utils/test-utils";
import nock from "nock";
import * as cheerio from "cheerio";
import decache from "decache";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper";

describe("Integration::register create password", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

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
          journey: getPermittedJourneyForPath(
            PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD
          ),
        };

        next();
      });

    app = await (await import("../../../app")).createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    await request(
      app,
      (test) => test.get(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD),
      { expectAnalyticsPropertiesMatchSnapshot: false }
    ).then((res) => {
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

  it("should return create password page", async () => {
    await request(app, (test) =>
      test.get(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD).expect(200)
    );
  });

  it("should return error when csrf not present", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD)
        .type("form")
        .send({
          email: "test@test.com",
          password: "test@test.com",
        })
        .expect(403)
    );
  });

  it("should return validation error when password not entered", async () => {
    await request(app, (test) =>
      test
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
          expect($("#password-error").text()).to.contains(
            "Enter your password"
          );
          expect($("#confirm-password-error").text()).to.contains(
            "Re-type your password"
          );
        })
        .expect(400)
    );
  });

  it("should return validation error when passwords don't match", async () => {
    await request(app, (test) =>
      test
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
        .expect(400)
    );
  });

  it("should return validation error when password less than 8 characters", async () => {
    await request(app, (test) =>
      test
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
        .expect(400)
    );
  });

  it("should return validation error when no numbers present in password", async () => {
    await request(app, (test) =>
      test
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
        .expect(400)
    );
  });

  it("should return validation error when password all numeric", async () => {
    await request(app, (test) =>
      test
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
        .expect(400)
    );
  });

  it("should return validation error when password is amongst most common passwords", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.SIGNUP_USER)
      .once()
      .reply(400, { code: 1040 });

    await request(app, (test) =>
      test
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
        .expect(400)
    );
  });

  it("should redirect to get security codes when valid password entered", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.SIGNUP_USER)
      .once()
      .reply(HTTP_STATUS_CODES.OK, {});

    await request(app, (test) =>
      test
        .post(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          password: "testpassword1",
          "confirm-password": "testpassword1",
        })
        .expect("Location", PATH_NAMES.GET_SECURITY_CODES)
        .expect(302)
    );
  });
});
