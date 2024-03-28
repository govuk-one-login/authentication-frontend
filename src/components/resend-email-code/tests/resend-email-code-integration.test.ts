import request from "supertest";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import { ERROR_CODES } from "../../common/constants";
import { getFrontendApiBaseUrl } from "../../../config";

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
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

        req.session.user = {
          email: "test@test.com",
          phoneNumber: "7867",
          journey: {
            nextPath: PATH_NAMES.CREATE_ACCOUNT_CHECK_EMAIL,
            optionalPaths: [PATH_NAMES.RESEND_EMAIL_CODE],
          },
        };

        next();
      });

    app = await require("../../../app").createApp();
    baseApi = getFrontendApiBaseUrl();

    await request(app)
      .get(PATH_NAMES.RESEND_EMAIL_CODE)
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

  it("should return resend email code page", (done) => {
    request(app).get(PATH_NAMES.RESEND_EMAIL_CODE).expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post(PATH_NAMES.RESEND_EMAIL_CODE)
      .type("form")
      .send({
        code: "123456",
      })
      .expect(500, done);
  });

  it("should redirect to /check-your-email when new code requested as part of account creation journey", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.SEND_NOTIFICATION)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    request(app)
      .post(PATH_NAMES.RESEND_EMAIL_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
      })
      .expect("Location", PATH_NAMES.CHECK_YOUR_EMAIL)
      .expect(302, done);
  });

  it("should render 'You cannot get a new security code at the moment' when OTP lockout timer cookie is active", () => {
    const testSpecificCookies = cookies + "; re=true";
    request(app)
      .get(PATH_NAMES.RESEND_EMAIL_CODE)
      .set("Cookie", testSpecificCookies)
      .expect((res) => {
        res.text.includes("You cannot get a new security code at the moment");
      });
  });

  it("should return 500 error screen when API call fails", (done) => {
    nock(baseApi).post(API_ENDPOINTS.SEND_NOTIFICATION).once().reply(500, {
      errorCode: "1234",
    });

    request(app)
      .post(PATH_NAMES.RESEND_EMAIL_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
      })
      .expect(500, done);
  });

  it("should redirect to /security-code-invalid-request when request OTP more than 5 times", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.SEND_NOTIFICATION)
      .times(6)
      .reply(400, { code: ERROR_CODES.VERIFY_EMAIL_MAX_CODES_SENT });

    request(app)
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
      .expect(302, done);
  });

  it("should redirect to /security-code-requested-too-many-times when exceeded OTP request limit", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.SEND_NOTIFICATION)
      .once()
      .reply(400, { code: ERROR_CODES.VERIFY_EMAIL_CODE_REQUEST_BLOCKED });

    request(app)
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
      .expect(302, done);
  });
});
