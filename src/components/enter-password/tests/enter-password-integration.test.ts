import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants";
import { ERROR_CODES } from "../../common/constants";

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

  it("should return enter password page", async () => {
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
    process.env.SUPPORT_2HR_LOCKOUT = "0";

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
          "Enter the correct password"
        );
      })
      .expect(400);
  });

  it("should redirect to /auth-code when password is correct (VTR Cm)", async () => {
    nock(baseApi).post(API_ENDPOINTS.LOG_IN_USER).once().reply(200);

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

  it("should redirect to /account-locked from sign-in flow when incorrect password entered 5 times", async () => {
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
      .expect("Location", PATH_NAMES.ACCOUNT_LOCKED)
      .expect(302);
  });
});
