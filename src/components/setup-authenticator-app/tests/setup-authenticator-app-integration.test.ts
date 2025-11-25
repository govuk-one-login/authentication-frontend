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
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";

describe("Integration::setup-authenticator-app", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;
  const AUTH_APP_SECRET: string = "MJRGA2KMETI7BEVNT33MOITMEQQUJMAQ";

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
            res.locals.persistentSessionId = "dips-123456-abc";

            req.session.user = {
              email: "test@test.com",
              journey: getPermittedJourneyForPath(
                PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP
              ),
              authAppSecret: AUTH_APP_SECRET,
            };

            next();
          }),
        },
      }
    );

    app = await createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    await request(app)
      .get(PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP)
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

  it("should return setup authenticator app page", async () => {
    await request(app)
      .get(PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP)
      .expect(200);
  });

  it("should return error when csrf not present", async () => {
    await request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP)
      .type("form")
      .send({
        code: "123456",
      })
      .expect(403);
  });

  it("should return validation error when access code not entered", async () => {
    await request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "Enter the code shown in your authenticator app"
        );
        expect($("#secret-key").text()).to.contain(AUTH_APP_SECRET);
      })
      .expect(400);
  });

  it("should return validation error when access code is too long (more than 6 digits)", async () => {
    await request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "12345678910",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "Enter the code using only 6 digits"
        );
        expect($("#secret-key").text()).to.contain(AUTH_APP_SECRET);
      })
      .expect(400);
  });

  it("should return validation error when code has non-digit characters", async () => {
    await request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "asdfgh",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "Enter the code using only 6 digits"
        );
        expect($("#secret-key").text()).to.contain(AUTH_APP_SECRET);
      })
      .expect(400);
  });

  it("should redirect to /account-created page when successful validation of code", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_MFA_CODE)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT, { success: true });
    nock(baseApi)
      .post(API_ENDPOINTS.SEND_NOTIFICATION)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT, { success: true });

    await request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123456",
      })
      .expect("Location", PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL)
      .expect(302);
  });
});
