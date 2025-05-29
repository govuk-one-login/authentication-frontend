import { describe } from "mocha";
import { expect, request, sinon } from "../../../../test/utils/test-utils.js";
import * as cheerio from "cheerio";
import { API_ENDPOINTS, HTTP_STATUS_CODES, PATH_NAMES } from "../../../app.constants.js";
import nock from "nock";
import { ERROR_CODES, SecurityCodeErrorType } from "../../common/constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";

describe("Integration::2fa auth app (in reset password flow)", () => {
  let app: any;
  let baseApi: string;
  let token: string | string[];
  let cookies: string;

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
              email: "test@test.com",
              journey: getPermittedJourneyForPath(PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP),
            };

            next();
          }),
        },
      }
    );

    app = await createApp();

    baseApi = process.env.FRONTEND_API_BASE_URL;

    nock(baseApi).persist().post("/mfa").reply(204);

    await request(app, (test) => test.get(PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP), {
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
  });

  it("should return updated check auth app page", async () => {
    nock(baseApi).persist().post("/mfa").reply(204);
    await request(app, (test) =>
      test
        .get(PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP)
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#updatedHeading").length).to.eq(1);
        })
        .expect(200)
    );
  });

  it("should redirect to reset password step when valid sms code is entered", async () => {
    nock(baseApi)
      .persist()
      .post(API_ENDPOINTS.VERIFY_MFA_CODE)
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {});

    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP)
        .type("form")
        .set("Cookie", cookies)
        .send({ _csrf: token, code: "123456" })
        .expect("Location", PATH_NAMES.RESET_PASSWORD)
        .expect(302)
    );
  });

  it("should return error page when when user is locked out", async () => {
    nock(baseApi)
      .persist()
      .post(API_ENDPOINTS.VERIFY_MFA_CODE)
      .reply(400, {
        code: ERROR_CODES.AUTH_APP_INVALID_CODE_MAX_ATTEMPTS_REACHED,
        success: false,
      });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP)
        .type("form")
        .set("Cookie", cookies)
        .send({ _csrf: token, code: "123456" })
        .expect(
          "Location",
          `${PATH_NAMES.SECURITY_CODE_INVALID}?actionType=${SecurityCodeErrorType.AuthAppMfaMaxRetries}`
        )
        .expect(302)
    );
  });
});
