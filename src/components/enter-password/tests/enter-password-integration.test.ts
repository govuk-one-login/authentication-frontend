import { describe } from "mocha";
import { expect, request, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants";
import { ERROR_CODES } from "../../common/constants";
import {
  noInterventions,
  setupAccountInterventionsResponse,
} from "../../../../test/helpers/account-interventions-helpers";

describe("Integration::enter password", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  const ENDPOINT = "/enter-password";

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");

    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        res.locals.clientSessionId = "gdsfsfdsgsdgsd-mjdzU854";
        res.locals.persistentSessionId = "dips-123456-abc";

        req.session.user = {
          email: "test@test.com",
          journey: {
            nextPath: PATH_NAMES.ENTER_PASSWORD,
          },
        };

        next();
      });

    process.env.SUPPORT_REAUTHENTICATION = "0";
    app = await require("../../../app").createApp();

    baseApi = process.env.FRONTEND_API_BASE_URL;

    await request(app, (test) => test.get(ENDPOINT), {
      expectTaxonomyMatchSnapshot: false,
    }).then((res) => {
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

  it("should return enter password page with sign in taxonomy", async () => {
    await request(app, (test) => test.get(ENDPOINT).expect(200));
  });

  it("should return error when csrf not present", async () => {
    await request(app, (test) =>
      test
        .post(ENDPOINT)
        .type("form")
        .send({
          password: "password",
        })
        .expect(403)
    );
  });

  it("should return validation error when password not entered", async () => {
    await request(app, (test) =>
      test
        .post(ENDPOINT)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          password: "",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#password-error").text()).to.contains(
            "Enter your password"
          );
        })
        .expect(400)
    );
  });

  it("should return validation error when password is incorrect", async () => {
    nock(baseApi).post(API_ENDPOINTS.LOG_IN_USER).once().reply(401);

    await request(app, (test) =>
      test
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
        .expect(400)
    );
  });

  it("should redirect to /auth-code when password is correct (VTR Cm)", async () => {
    nock(baseApi).post(API_ENDPOINTS.LOG_IN_USER).once().reply(200);

    await request(app, (test) =>
      test
        .post(ENDPOINT)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          password: "password",
        })
        .expect("Location", PATH_NAMES.AUTH_CODE)
        .expect(302)
    );
  });

  it("should redirect to /reset-password-2fa-sms when password is correct and user's MFA is set to SMS when 2FA is not required", async () => {
    nock(baseApi).post(API_ENDPOINTS.LOG_IN_USER).once().reply(200, {
      mfaRequired: false,
      mfaMethodType: "SMS",
      passwordChangeRequired: true,
    });

    setupAccountInterventionsResponse(baseApi, noInterventions);

    await request(app, (test) =>
      test
        .post(ENDPOINT)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          password: "password",
        })
        .expect("Location", PATH_NAMES.RESET_PASSWORD_REQUIRED)
        .expect(302)
    );
  });

  it("should redirect to /reset-password-2fa-sms when password is correct and user's MFA is set to SMS when 2FA is required", async () => {
    nock(baseApi).post(API_ENDPOINTS.LOG_IN_USER).once().reply(200, {
      mfaRequired: true,
      mfaMethodType: "SMS",
      passwordChangeRequired: true,
    });

    setupAccountInterventionsResponse(baseApi, noInterventions);

    await request(app, (test) =>
      test
        .post(ENDPOINT)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          password: "password",
        })
        .expect("Location", PATH_NAMES.RESET_PASSWORD_2FA_SMS)
        .expect(302)
    );
  });

  it("should redirect to /account-locked from sign-in flow when incorrect password entered 5 times", async () => {
    nock(baseApi).post(API_ENDPOINTS.LOG_IN_USER).times(6).reply(400, {
      code: ERROR_CODES.INVALID_PASSWORD_MAX_ATTEMPTS_REACHED,
    });

    await request(app, (test) =>
      test
        .post(ENDPOINT)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          password: "password",
        })
        .expect("Location", PATH_NAMES.ACCOUNT_LOCKED)
        .expect(302)
    );
  });
});
