import { describe } from "mocha";
import { expect, sinon, request } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import * as cheerio from "cheerio";
import decache from "decache";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants.js";
import { ERROR_CODES, SecurityCodeErrorType } from "../../common/constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
describe("Integration:: check your email", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(async () => {
    process.env.SUPPORT_CHECK_EMAIL_FRAUD = "1";
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
          journey: getPermittedJourneyForPath(PATH_NAMES.CHECK_YOUR_EMAIL),
        };

        next();
      });

    app = await (await import("../../../app")).createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    await request(app, (test) => test.get(PATH_NAMES.CHECK_YOUR_EMAIL), {
      expectAnalyticsPropertiesMatchSnapshot: false,
    }).then((res) => {
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
    delete process.env.SUPPORT_CHECK_EMAIL_FRAUD;
  });

  it("should return verify email page", async () => {
    await request(app, (test) =>
      test.get(PATH_NAMES.CHECK_YOUR_EMAIL).expect(200)
    );
  });

  it("should return error when csrf not present", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_EMAIL)
        .type("form")
        .send({
          code: "123456",
        })
        .expect(403)
    );
  });

  it("should return validation error when code not entered", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_EMAIL)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#code-error").text()).to.contains("Enter the code");
        })
        .expect(400)
    );
  });

  it("should return validation error when code is less than 6 characters", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_EMAIL)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "2",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#code-error").text()).to.contains(
            "Enter the code using only 6 digits"
          );
        })
        .expect(400)
    );
  });

  it("should return validation error when code is greater than 6 characters", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_EMAIL)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "1234567",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#code-error").text()).to.contains(
            "Enter the code using only 6 digits"
          );
        })
        .expect(400)
    );
  });

  it("should return validation error when code entered contains letters", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_EMAIL)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "12ert-",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#code-error").text()).to.contains(
            "Enter the code using only 6 digits"
          );
        })
        .expect(400)
    );
  });

  it("should redirect to /create-password when valid code entered", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_CODE)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {});

    nock(baseApi)
      .post(API_ENDPOINTS.CHECK_EMAIL_FRAUD_BLOCK)
      .once()
      .reply(HTTP_STATUS_CODES.OK, {
        email: "test@test.com",
        isBlockedStatus: "Pending",
      });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_EMAIL)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123456",
        })
        .expect("Location", PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD)
        .expect(302)
    );
  });

  it("should return validation error when incorrect code entered", async () => {
    nock(baseApi).post(API_ENDPOINTS.VERIFY_CODE).once().reply(400, {
      code: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
      success: false,
    });

    nock(baseApi)
      .post(API_ENDPOINTS.CHECK_EMAIL_FRAUD_BLOCK)
      .once()
      .reply(HTTP_STATUS_CODES.OK, {
        email: "test@test.com",
        isBlockedStatus: "Pending",
      });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_EMAIL)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123455",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#code-error").text()).to.contains(
            "The code you entered is not correct, or may have expired, try entering it again or request a new code"
          );
        })
        .expect(400)
    );
  });

  it("should return error page when incorrect code entered more than 5 times", async () => {
    nock(baseApi).post(API_ENDPOINTS.VERIFY_CODE).times(6).reply(400, {
      code: ERROR_CODES.ENTERED_INVALID_VERIFY_EMAIL_CODE_MAX_TIMES,
      success: false,
    });

    nock(baseApi)
      .post(API_ENDPOINTS.CHECK_EMAIL_FRAUD_BLOCK)
      .once()
      .reply(HTTP_STATUS_CODES.OK, {
        email: "test@test.com",
        isBlockedStatus: "Pending",
      });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_EMAIL)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123455",
        })
        .expect(
          "Location",
          `${PATH_NAMES.SECURITY_CODE_INVALID}?actionType=${SecurityCodeErrorType.EmailMaxRetries}`
        )
        .expect(302)
    );
  });
});
