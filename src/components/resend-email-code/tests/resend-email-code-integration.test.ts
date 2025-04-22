import { describe } from "mocha";
import { request, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import { ERROR_CODES } from "../../common/constants";
import { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper";

describe("Integration:: resend email code", () => {
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
      .callsFake(function (
        req: Request,
        res: Response,
        next: NextFunction
      ): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

        req.session.user = {
          email: "test@test.com",
          mfaMethods: buildMfaMethods({ phoneNumber: "7867" }),
          journey: getPermittedJourneyForPath(PATH_NAMES.RESEND_EMAIL_CODE),
        };

        next();
      });

    app = await require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    await request(app, (test) => test.get(PATH_NAMES.RESEND_EMAIL_CODE)).then(
      (res) => {
        const $ = cheerio.load(res.text);
        token = $("[name=_csrf]").val();
        cookies = res.headers["set-cookie"];
      }
    );
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it("should return resend email code page", async () => {
    await request(app, (test) =>
      test.get(PATH_NAMES.RESEND_EMAIL_CODE).expect(200)
    );
  });

  it("should return error when csrf not present", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESEND_EMAIL_CODE)
        .type("form")
        .send({
          code: "123456",
        })
        .expect(403)
    );
  });

  it("should redirect to /check-your-email when new code requested as part of account creation journey", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.SEND_NOTIFICATION)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESEND_EMAIL_CODE)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
        })
        .expect("Location", PATH_NAMES.CHECK_YOUR_EMAIL)
        .expect(302)
    );
  });

  it("should render 'You cannot get a new security code at the moment' when OTP lockout timer cookie is active", async () => {
    const testSpecificCookies = cookies + "; re=true";
    await request(app, (test) =>
      test
        .get(PATH_NAMES.RESEND_EMAIL_CODE)
        .set("Cookie", testSpecificCookies)
        .expect((res) => {
          res.text.includes("You cannot get a new security code at the moment");
        })
    );
  });

  it("should return 500 error screen when API call fails", async () => {
    nock(baseApi).post(API_ENDPOINTS.SEND_NOTIFICATION).once().reply(500, {
      errorCode: "1234",
    });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESEND_EMAIL_CODE)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
        })
        .expect(500)
    );
  });

  it("should redirect to /security-code-invalid-request when request OTP more than 5 times", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.SEND_NOTIFICATION)
      .times(6)
      .reply(400, { code: ERROR_CODES.VERIFY_EMAIL_MAX_CODES_SENT });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESEND_EMAIL_CODE)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
        })
        .expect(
          "Location",
          "/security-code-invalid-request?actionType=emailMaxCodesSent"
        )
        .expect(302)
    );
  });

  it("should redirect to /security-code-requested-too-many-times when exceeded OTP request limit", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.SEND_NOTIFICATION)
      .once()
      .reply(400, { code: ERROR_CODES.VERIFY_EMAIL_CODE_REQUEST_BLOCKED });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESEND_EMAIL_CODE)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
        })
        .expect(
          "Location",
          "/security-code-requested-too-many-times?actionType=emailBlocked"
        )
        .expect(302)
    );
  });
});
