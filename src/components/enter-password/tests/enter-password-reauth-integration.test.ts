import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import request from "supertest";
import * as cheerio from "cheerio";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants.js";
import { ERROR_CODES } from "../../common/constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";

const REDIRECT_URI = "https://rp.host/redirect";

describe("Integration::enter password", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  const ENDPOINT = "/enter-password";

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
            res.locals.clientSessionId = "gdsfsfdsgsdgsd-mjdzU854";
            res.locals.persistentSessionId = "dips-123456-abc";

            req.session.user = {
              email: "test@test.com",
              journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_PASSWORD),
              reauthenticate: "subject",
            };

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
    process.env.SUPPORT_REAUTHENTICATION = "1";

    await request(app)
      .get(ENDPOINT)
      .then((res) => {
        const $ = cheerio.load(res.text);
        token = $("[name=_csrf]").val();
        cookies = res.headers["set-cookie"];
      });
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  it("should return enter password page with reauth analytics properties", async () => {
    await request(app).get(ENDPOINT).expect(200);
  });

  it("should return error when csrf not present", async () => {
    await request(app)
      .post(ENDPOINT)
      .type("form")
      .send({
        password: "password",
      })
      .expect(403);
  });

  it("should return validation error when password not entered", async () => {
    await request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        password: "",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#password-error").text()).to.contains("Enter your password");
      })
      .expect(400);
  });

  it("should return validation error when password is incorrect", async () => {
    nock(baseApi).post(API_ENDPOINTS.LOG_IN_USER).once().reply(401);

    await request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        password: "pasasd",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#password-error").text()).to.contains(
          "The password you entered is not correct"
        );
      })
      .expect(400);
  });

  it("should redirect to /auth-code when password is correct (VTR Cm)", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.LOG_IN_USER)
      .once()
      .reply(200, {
        mfaMethods: buildMfaMethods({
          id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7a3a03d7",
          phoneNumber: "07123456789",
          redactedPhoneNumber: "789",
        }),
      });

    await request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        password: "password",
      })
      .expect("Location", PATH_NAMES.AUTH_CODE)
      .expect(302);
  });

  it("should sign out of re-authentication flow when incorrect password entered 5 times", async () => {
    nock(baseApi).post(API_ENDPOINTS.LOG_IN_USER).times(6).reply(400, {
      code: ERROR_CODES.INVALID_PASSWORD_MAX_ATTEMPTS_REACHED,
    });

    await request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        password: "password",
      })
      .expect("Location", REDIRECT_URI.concat("?error=login_required"))
      .expect(302);
  });

  it("should sign out of re-authentication flow when user has reached limit on other reauth credentials", async () => {
    nock(baseApi).post(API_ENDPOINTS.LOG_IN_USER).times(6).reply(400, {
      code: ERROR_CODES.RE_AUTH_SIGN_IN_DETAILS_ENTERED_EXCEEDED,
    });

    await request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        password: "password",
      })
      .expect("Location", REDIRECT_URI.concat("?error=login_required"))
      .expect(302);
  });
});
