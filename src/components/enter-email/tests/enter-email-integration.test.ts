import { afterEach, describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import * as cheerio from "cheerio";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants.js";
import nock from "nock";
import request from "supertest";
import { ERROR_CODES } from "../../common/constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";

const REDIRECT_URI = "https://rp.host/redirect";

describe("Integration::enter email", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(async () => {
    const { createApp } = await esmock(
      "../../../app.js",
      {},
      {
        "../../../middleware/session-middleware.js": {
          validateSessionMiddleware: sinon.fake(function (
            req: Request,
            res: Response,
            next: NextFunction
          ): void {
            res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

            req.session.user = {
              journey: getPermittedJourneyForPath(
                PATH_NAMES.ENTER_EMAIL_SIGN_IN
              ),
            };

            if (process.env.TEST_SETUP_REAUTH_SESSION === "1") {
              req.session.user.reauthenticate = "12345";
            }

            req.session.client = {
              redirectUri: REDIRECT_URI,
            };

            next();
          }),
        },
      }
    );

    app = await createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    await request(app)
      .get(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
      .then((res) => {
        const $ = cheerio.load(res.text);
        token = $("[name=_csrf]").val();
        cookies = res.headers["set-cookie"];
      });
  });

  beforeEach(() => {
    nock.cleanAll();
    sinon.restore(); // Restore all stubs before each test
    process.env.SUPPORT_REAUTHENTICATION = "0";
    process.env.TEST_SETUP_REAUTH_SESSION = "0";
  });

  afterEach(() => {
    nock.cleanAll();
    sinon.restore(); // Restore all stubs after each test
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it("should return enter email page with sign in analytics properties", async () => {
    await request(app).get(PATH_NAMES.ENTER_EMAIL_SIGN_IN).expect(200);
  });

  it("should return enter email page with reauth analytics properties", async () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
    process.env.TEST_SETUP_REAUTH_SESSION = "1";
    await request(app).get(PATH_NAMES.ENTER_EMAIL_SIGN_IN).expect(200);
  });

  it("should return error when csrf not present", async () => {
    await request(app)
      .post(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
      .type("form")
      .send({
        email: "test@test.com",
      })
      .expect(403);
  });

  it("should return validation error when email not entered", async () => {
    await request(app)
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
      .expect(400);
  });

  it("should return validation error when invalid email entered", async () => {
    await request(app)
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

    await request(app)
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

    await request(app)
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
      .expect(400);
  });

  it("should redirect to /enter-password page when email address exists", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.USER_EXISTS)
      .once()
      .reply(HTTP_STATUS_CODES.OK, {
        email: "test@test.com",
        doesUserExist: true,
      });

    await request(app)
      .post(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect("Location", PATH_NAMES.ENTER_PASSWORD)
      .expect(302);
  });

  it("should redirect to /account-not-found when email address not found", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.USER_EXISTS)
      .once()
      .reply(HTTP_STATUS_CODES.OK, {
        email: "test@test.com",
        doesUserExist: false,
      });

    await request(app)
      .post(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect("Location", PATH_NAMES.ACCOUNT_NOT_FOUND)
      .expect(302);
  });

  it("should return internal server error when /user-exists API call response is 500", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.USER_EXISTS)
      .once()
      .reply(500, {
        message: "Internal Server error",
      })
      .post("/send-notification")
      .once()
      .reply(200, {});

    await request(app)
      .post(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect(500);
  });

  it("should redirect to /enter-password page when email address exists and check re-auth users api call is successfully", async () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
    process.env.TEST_SETUP_REAUTH_SESSION = "1";

    nock(baseApi)
      .post(API_ENDPOINTS.CHECK_REAUTH_USER)
      .once()
      .reply(HTTP_STATUS_CODES.OK);

    nock(baseApi)
      .post(API_ENDPOINTS.USER_EXISTS)
      .once()
      .reply(HTTP_STATUS_CODES.OK, {
        email: "test@test.com",
        doesUserExist: true,
      });

    await request(app)
      .post(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect("Location", PATH_NAMES.ENTER_PASSWORD)
      .expect(302);
  });

  it("should redirect to /signed-out with login_required error when user fails re-auth", async () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
    process.env.TEST_SETUP_REAUTH_SESSION = "1";

    nock(baseApi)
      .post(API_ENDPOINTS.CHECK_REAUTH_USER)
      .once()
      .reply(HTTP_STATUS_CODES.BAD_REQUEST, {
        code: ERROR_CODES.RE_AUTH_SIGN_IN_DETAILS_ENTERED_EXCEEDED,
      });

    nock(baseApi)
      .post(API_ENDPOINTS.USER_EXISTS)
      .once()
      .reply(HTTP_STATUS_CODES.OK, {
        email: "test@test.com",
        doesUserExist: true,
      });

    await request(app)
      .post(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect("Location", REDIRECT_URI.concat("?error=login_required"))
      .expect(302);
  });
});
