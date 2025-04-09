import { describe } from "mocha";
import { expect, request, sinon } from "../../../../test/utils/test-utils.js";
import decache from "decache";

import * as cheerio from "cheerio";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants.js";
import nock from "nock";
import { ERROR_CODES } from "../../common/constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
describe("Integration::reset password check email ", () => {
  let app: any;
  let baseApi: string;
  let token: string | string[];
  let cookies: string;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = await import(
      "../../../middleware/session-middleware"
    );

    process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "0";

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
            PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL
          ),
        };
        req.session.user.enterEmailMfaType = "SMS";
        next();
      });

    app = await (await import("../../../app")).createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    nock(baseApi).post(API_ENDPOINTS.RESET_PASSWORD_REQUEST).once().reply(204);

    await request(
      app,
      (test) => test.get(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL),
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

  it("should return reset password check email page", async () => {
    nock(baseApi).post(API_ENDPOINTS.RESET_PASSWORD_REQUEST).once().reply(200);
    await request(app, (test) =>
      test.get(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL).expect(200)
    );
  });

  it("should return error page when 6 password reset codes requested", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.RESET_PASSWORD_REQUEST)
      .times(6)
      .reply(400, { code: 1022 });

    await request(app, (test) =>
      test
        .get(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL)
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($(".govuk-heading-l").text()).to.contains(
            "You asked to resend the security code too many times"
          );
        })
        .expect(200)
    );
  });

  it("should return 2hr error page when 6 incorrect codes entered and flag is turned on", async () => {
    nock(baseApi).post(API_ENDPOINTS.RESET_PASSWORD_REQUEST).reply(400, {
      code: ERROR_CODES.ENTERED_INVALID_PASSWORD_RESET_CODE_MAX_TIMES,
    });

    await request(app, (test) =>
      test
        .get(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL)
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($(".govuk-heading-l").text()).to.contains(
            "You cannot sign in at the moment"
          );
          expect($(".govuk-body").text()).to.contains("Wait for 2 hours");
        })
        .expect(200)
    );
  });

  it("should return error page when blocked from requesting codes", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.RESET_PASSWORD_REQUEST)
      .once()
      .reply(400, { code: 1023 });

    await request(app, (test) =>
      test
        .get(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL)
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($(".govuk-heading-l").text()).to.contains(
            "You cannot sign in at the moment"
          );
        })
        .expect(200)
    );
  });

  it("should redisplay page with error", async () => {
    nock(baseApi).post(API_ENDPOINTS.VERIFY_CODE).reply(400, { code: 1021 });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123456",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#code-error").text()).to.contains(
            "The code you entered is not correct"
          );
        })
        .expect(400)
    );
  });

  it("should return internal server error when /reset-password-request API call response is 500", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.RESET_PASSWORD_REQUEST)
      .once()
      .reply(500, {});
    await request(app, (test) =>
      test.get(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL).expect(500)
    );
  });

  it("should redirect to /reset-password if code is correct", async () => {
    nock(baseApi)
      .persist()
      .post(API_ENDPOINTS.VERIFY_CODE)
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {});

    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123456",
        })
        .expect("Location", PATH_NAMES.RESET_PASSWORD_2FA_SMS)
        .expect(302)
    );
  });
});
