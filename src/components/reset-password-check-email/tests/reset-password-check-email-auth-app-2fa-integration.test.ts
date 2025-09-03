import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import * as cheerio from "cheerio";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants.js";
import nock from "nock";
import request from "supertest";
import {
  noInterventions,
  setupAccountInterventionsResponse,
} from "../../../../test/helpers/account-interventions-helpers.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";

describe("Integration::reset password check email ", () => {
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
              journey: getPermittedJourneyForPath(
                PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL
              ),
            };
            req.session.user.mfaMethodType = "AUTH_APP";
            next();
          }),
        },
      }
    );

    app = await createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    nock(baseApi)
      .post("/reset-password-request")
      .once()
      .reply(200, {
        mfaMethods: buildMfaMethods({ id: "test-id", authApp: true }),
        mfaMethodType: "AUTH_APP",
      });

    await request(app)
      .get(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL)
      .then((res) => {
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
    nock(baseApi)
      .post(API_ENDPOINTS.RESET_PASSWORD_REQUEST)
      .once()
      .reply(200, { mfaMethods: [] });
    await request(app).get(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL).expect(200);
  });

  it("should redirect to /reset-password-2fa-auth-app if user's 2FA is set to AUTH_APP", async () => {
    nock(baseApi)
      .persist()
      .post(API_ENDPOINTS.VERIFY_CODE)
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {});

    setupAccountInterventionsResponse(baseApi, noInterventions);

    await request(app)
      .post(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123456",
      })
      .expect("Location", PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP)
      .expect(302);
  });
});
