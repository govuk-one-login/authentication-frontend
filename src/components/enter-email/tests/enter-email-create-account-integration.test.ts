import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import request from "supertest";
import * as cheerio from "cheerio";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants.js";
import { ERROR_CODES, SecurityCodeErrorType } from "../../common/constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { extractCsrfTokenAndCookies } from "../../../../test/helpers/csrf-helper.js";
import esmock from "esmock";

describe("Integration::enter email (create account)", () => {
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
                PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT
              ),
            };

            next();
          }),
        },
      }
    );

    app = await createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    ({ token, cookies } = extractCsrfTokenAndCookies(
      await request(app).get(PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT)
    ));
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it("should return enter email page", async () => {
    await request(app).get(PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT).expect(200);
  });

  it("should return error when csrf not present", async () => {
    await request(app)
      .post(PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT)
      .type("form")
      .send({
        email: "test@test.com",
      })
      .expect(403);
  });

  it("should return validation error when email not entered", async () => {
    await request(app)
      .post(PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT)
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
      .post(PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT)
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
      .post(PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT)
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
      .post(PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT)
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
      .post(PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect("Location", PATH_NAMES.ENTER_PASSWORD_ACCOUNT_EXISTS)
      .expect(302);
  });

  it("should redirect to /check-your-email when email address not found", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.USER_EXISTS)
      .once()
      .reply(200, {
        email: "test@test.com",
        doesUserExist: false,
      })
      .post(API_ENDPOINTS.SEND_NOTIFICATION)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    await request(app)
      .post(PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect("Location", PATH_NAMES.CHECK_YOUR_EMAIL)
      .expect(302);
  });

  it("should return internal server error when /user-exists API call response is 500", async () => {
    nock(baseApi).post(API_ENDPOINTS.USER_EXISTS).once().reply(500, {
      message: "Internal Server error",
    });

    await request(app)
      .post(PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect(500);
  });

  it("should redirect to /security-code-requested-too-many-times when exceeded OTP request limit", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.USER_EXISTS)
      .once()
      .reply(200, {
        email: "test@test.com",
        doesUserExist: false,
      })
      .post(API_ENDPOINTS.SEND_NOTIFICATION)
      .once()
      .reply(400, { code: ERROR_CODES.VERIFY_EMAIL_CODE_REQUEST_BLOCKED });

    await request(app)
      .post(PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect(
        "Location",
        `${PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED}?actionType=${SecurityCodeErrorType.EmailBlocked}`
      )
      .expect(302);
  });

  it("should redirect to /security-code-invalid-request when request OTP more than 5 times", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.USER_EXISTS)
      .once()
      .reply(200, {
        email: "test@test.com",
        doesUserExist: false,
      })
      .post(API_ENDPOINTS.SEND_NOTIFICATION)
      .once()
      .reply(400, { code: ERROR_CODES.VERIFY_EMAIL_MAX_CODES_SENT });

    await request(app)
      .post(PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "test@test.com",
      })
      .expect((res) => {
        res.text.includes(
          "you asked to resend the security code too many codes"
        );
      })
      .expect(200);
  });
});

describe("Integration::enter email (create account request)", () => {
  it(`should redirect to ${PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT} when ${PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT_REQUEST} is accessed`, async () => {
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
              journey: getPermittedJourneyForPath(PATH_NAMES.SIGN_IN_OR_CREATE),
            };
            next();
          }),
        },
      }
    );

    const app = await createApp();

    await request(app)
      .get(PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT_REQUEST)
      .expect("Location", PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT)
      .expect(302);
  });
});
