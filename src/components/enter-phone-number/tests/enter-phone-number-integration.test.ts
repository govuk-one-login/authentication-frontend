import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import { ERROR_CODES, SecurityCodeErrorType } from "../../common/constants";

describe("Integration::enter phone number", () => {
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
          phoneNumber: "******7867",
          journey: {
            nextPath: PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
          },
        };

        next();
      });

    app = await require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    request(app)
      .get(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
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
  });

  it("should return enter phone number page", (done) => {
    request(app)
      .get(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
      .expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
      .type("form")
      .send({
        phoneNumber: "123456789",
      })
      .expect(500, done);
  });

  it("should return validation error when uk phone number not entered", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        phoneNumber: "",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#phoneNumber-error").text()).to.contains(
          "Enter a phone number"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when uk phone number entered is not valid", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        phoneNumber: "123456789",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#phoneNumber-error").text()).to.contains(
          "Enter a UK mobile phone number"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when uk phone number entered contains text", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        phoneNumber: "123456789dd",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#phoneNumber-error").text()).to.contains(
          "Enter a phone number using only numbers or the + symbol"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when uk phone number entered less than 12 characters", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        phoneNumber: "123",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#phoneNumber-error").text()).to.contains(
          "Enter a UK mobile phone number, like 07700 900000"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when uk phone number entered greater than 12 characters", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        phoneNumber: "123123123123123123",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#phoneNumber-error").text()).to.contains(
          "Enter a UK mobile phone number, like 07700 900000"
        );
      })
      .expect(400, done);
  });

  it("should redirect to /check-your-phone page when valid UK phone number entered", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.UPDATE_PROFILE)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT)
      .post("/send-notification")
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        phoneNumber: "07738394991",
      })
      .expect("Location", PATH_NAMES.CHECK_YOUR_PHONE)
      .expect(302, done);
  });

  it("should return validation error when international phone number not entered", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        hasInternationalPhoneNumber: true,
        internationalPhoneNumber: "",
        supportInternationalNumbers: true,
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#internationalPhoneNumber-error").text()).to.contains(
          "Enter a phone number"
        );
        expect($("#phoneNumber-error").text()).to.contains("");
      })
      .expect(400, done);
  });

  it("should return validation error when international phone number entered is not valid", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        hasInternationalPhoneNumber: true,
        internationalPhoneNumber: "123456789",
        supportInternationalNumbers: true,
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#internationalPhoneNumber-error").text()).to.contains(
          "Enter a phone number in the correct format"
        );
        expect($("#phoneNumber-error").text()).to.contains("");
      })
      .expect(400, done);
  });

  it("should return validation error when international phone number entered contains text", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        hasInternationalPhoneNumber: true,
        internationalPhoneNumber: "123456789dd",
        supportInternationalNumbers: true,
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#internationalPhoneNumber-error").text()).to.contains(
          "Enter a phone number using only numbers or the + symbol"
        );
        expect($("#phoneNumber-error").text()).to.contains("");
      })
      .expect(400, done);
  });

  it("should return validation error when international phone number entered less than 8 characters", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        hasInternationalPhoneNumber: true,
        internationalPhoneNumber: "1234567",
        supportInternationalNumbers: true,
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#internationalPhoneNumber-error").text()).to.contains(
          "Enter a phone number in the correct format"
        );
        expect($("#phoneNumber-error").text()).to.contains("");
      })
      .expect(400, done);
  });

  it("should return validation error when international phone number entered greater than 16 characters", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        hasInternationalPhoneNumber: true,
        internationalPhoneNumber: "12345678901234567",
        supportInternationalNumbers: true,
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#internationalPhoneNumber-error").text()).to.contains(
          "Enter a phone number in the correct format"
        );
        expect($("#phoneNumber-error").text()).to.contains("");
      })
      .expect(400, done);
  });

  it("should redirect to /check-your-phone page when valid international phone number entered", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.UPDATE_PROFILE)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT)
      .post("/send-notification")
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        hasInternationalPhoneNumber: true,
        internationalPhoneNumber: "+33645453322",
        supportInternationalNumbers: true,
      })
      .expect("Location", PATH_NAMES.CHECK_YOUR_PHONE)
      .expect(302, done);
  });

  it("should redirect to /security-code-requested-too-many-times when request OTP more than 5 times", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.UPDATE_PROFILE)
      .times(6)
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {})
      .post("/send-notification")
      .times(6)
      .reply(400, {
        code: ERROR_CODES.VERIFY_PHONE_NUMBER_MAX_CODES_SENT,
        success: false,
      });

    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        phoneNumber: "07738394991",
      })
      .expect(
        "Location",
        `${PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED}?actionType=${SecurityCodeErrorType.OtpMaxCodesSent}`
      )
      .expect(302, done);
  });

  it("should redirect to /security-code-invalid-request when exceeded OTP request limit", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.UPDATE_PROFILE)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT)
      .post("/send-notification")
      .once()
      .reply(400, {
        code: ERROR_CODES.VERIFY_PHONE_NUMBER_CODE_REQUEST_BLOCKED,
        success: false,
      });

    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        phoneNumber: "07738394991",
      })
      .expect(
        "Location",
        `${PATH_NAMES.SECURITY_CODE_WAIT}?actionType=${SecurityCodeErrorType.OtpBlocked}`
      )
      .expect(302, done);
  });

  it("should return internal server error if /update-profile api call fails", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.UPDATE_PROFILE)
      .once()
      .reply(500, {
        sessionState: "done",
      })
      .post("/send-notification")
      .once()
      .reply(200, {});

    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        phoneNumber: "07738394991",
      })
      .expect(500, done);
  });
});
