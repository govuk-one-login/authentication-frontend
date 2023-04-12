import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import cheerio from "cheerio";
import decache from "decache";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import { ERROR_CODES, SecurityCodeErrorType } from "../../common/constants";

describe("Integration:: check your phone", () => {
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
          journey: {
            nextPath: PATH_NAMES.CHECK_YOUR_PHONE,
          },
        };

        next();
      });

    app = await require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    request(app)
      .get(PATH_NAMES.CHECK_YOUR_PHONE)
      .end((err, res) => {
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

  it("should return check your phone page", (done) => {
    request(app).get(PATH_NAMES.CHECK_YOUR_PHONE).expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post(PATH_NAMES.CHECK_YOUR_PHONE)
      .type("form")
      .send({
        code: "123456",
      })
      .expect(500, done);
  });

  it("should return validation error when code not entered", (done) => {
    request(app)
      .post(PATH_NAMES.CHECK_YOUR_PHONE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains("Enter the security code");
      })
      .expect(400, done);
  });

  it("should return validation error when code is less than 6 characters", (done) => {
    request(app)
      .post(PATH_NAMES.CHECK_YOUR_PHONE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "2",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "Enter the security code using only 6 digits"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when code is greater than 6 characters", (done) => {
    request(app)
      .post(PATH_NAMES.CHECK_YOUR_PHONE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "1234567",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "Enter the security code using only 6 digits"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when code entered contains letters", (done) => {
    request(app)
      .post(PATH_NAMES.CHECK_YOUR_PHONE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "12ert-",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "Enter the security code using only 6 digits"
        );
      })
      .expect(400, done);
  });

  it("should redirect to /create-password when valid code entered", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_MFA_CODE)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {})
      .post(API_ENDPOINTS.SEND_NOTIFICATION)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    request(app)
      .post(PATH_NAMES.CHECK_YOUR_PHONE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123456",
      })
      .expect("Location", PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL)
      .expect(302, done);
  });

  it("should return validation error when incorrect code entered", (done) => {
    nock(baseApi).post(API_ENDPOINTS.VERIFY_MFA_CODE).once().reply(400, {
      code: ERROR_CODES.INVALID_VERIFY_PHONE_NUMBER_CODE,
      success: false,
    });

    request(app)
      .post(PATH_NAMES.CHECK_YOUR_PHONE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123455",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "The security code you entered is not correct, or may have expired, try entering it again or request a new code"
        );
      })
      .expect(400, done);
  });

  it("should redirect to security code expired when incorrect code has been entered 5 times", (done) => {
    nock(baseApi).post(API_ENDPOINTS.VERIFY_MFA_CODE).times(6).reply(400, {
      code: ERROR_CODES.ENTERED_INVALID_VERIFY_PHONE_NUMBER_CODE_MAX_TIMES,
      success: false,
    });

    request(app)
      .post(PATH_NAMES.CHECK_YOUR_PHONE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123455",
      })
      .expect(
        "Location",
        `${PATH_NAMES.SECURITY_CODE_INVALID}?actionType=${SecurityCodeErrorType.OtpMaxRetries}`
      )
      .expect(302, done);
  });
});
