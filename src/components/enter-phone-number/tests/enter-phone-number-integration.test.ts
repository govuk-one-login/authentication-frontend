import { describe } from "mocha";
import { expect, request, sinon } from "../../../../test/utils/test-utils.js";
import * as cheerio from "cheerio";
import decache from "decache";
import { HTTP_STATUS_CODES, PATH_NAMES } from "../../../app.constants.js";
import { ERROR_CODES, pathWithQueryParam } from "../../common/constants.js";
import nock from "nock";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";

describe("Integration::enter phone number", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = await import(
      "../../../middleware/session-middleware"
    );

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
          journey: getPermittedJourneyForPath(
            PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER
          ),
          isAccountCreationJourney: true,
        };

        next();
      });

    app = await (await import("../../../app")).createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    await request(
      app,
      (test) => test.get(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER),
      { expectAnalyticsPropertiesMatchSnapshot: false }
    ).then((res) => {
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

  it("should return enter phone number page", async () => {
    await request(app, (test) =>
      test.get(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER).expect(200)
    );
  });

  it("should return error when csrf not present", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
        .type("form")
        .send({
          phoneNumber: "123456789",
        })
        .expect(403)
    );
  });

  it("should return validation error when uk phone number not entered", async () => {
    await request(app, (test) =>
      test
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
            "Enter a UK mobile phone number"
          );
        })
        .expect(400)
    );
  });

  it("should return validation error when uk phone number entered is not valid", async () => {
    await request(app, (test) =>
      test
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
        .expect(400)
    );
  });

  it("should return validation error when uk phone number entered contains text", async () => {
    await request(app, (test) =>
      test
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
            "Enter a UK mobile phone number using only numbers or the + symbol"
          );
        })
        .expect(400)
    );
  });

  it("should return validation error when uk phone number entered less than 12 characters", async () => {
    await request(app, (test) =>
      test
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
        .expect(400)
    );
  });

  it("should return validation error when uk phone number entered greater than 12 characters", async () => {
    await request(app, (test) =>
      test
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
        .expect(400)
    );
  });

  it("should redirect to /check-your-phone page when valid UK phone number entered", async () => {
    nock(baseApi)
      .post("/send-notification")
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    await request(app, (test) =>
      test
        .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          phoneNumber: "07738394991",
        })
        .expect("Location", PATH_NAMES.CHECK_YOUR_PHONE)
        .expect(302)
    );
  });

  it("should return validation error when international phone number not entered", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          hasInternationalPhoneNumber: true,
          internationalPhoneNumber: "",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#internationalPhoneNumber-error").text()).to.contains(
            "Enter a mobile phone number"
          );
          expect($("#phoneNumber-error").text()).to.contains("");
        })
        .expect(400)
    );
  });

  it("should return validation error when international phone number entered is not valid", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          hasInternationalPhoneNumber: true,
          internationalPhoneNumber: "123456789",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#internationalPhoneNumber-error").text()).to.contains(
            "Enter a mobile phone number in the correct format, including the country code"
          );
          expect($("#phoneNumber-error").text()).to.contains("");
        })
        .expect(400)
    );
  });

  it("should return validation error when international phone number entered contains text", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          hasInternationalPhoneNumber: true,
          internationalPhoneNumber: "123456789dd",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#internationalPhoneNumber-error").text()).to.contains(
            "Enter a mobile phone number using only numbers or the + symbol"
          );
          expect($("#phoneNumber-error").text()).to.contains("");
        })
        .expect(400)
    );
  });

  it("should return validation error when international phone number entered less than 8 characters", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          hasInternationalPhoneNumber: true,
          internationalPhoneNumber: "1234567",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#internationalPhoneNumber-error").text()).to.contains(
            "Enter a mobile phone number in the correct format, including the country code"
          );
          expect($("#phoneNumber-error").text()).to.contains("");
        })
        .expect(400)
    );
  });

  it("should return validation error when international phone number entered greater than 16 characters", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          hasInternationalPhoneNumber: true,
          internationalPhoneNumber: "12345678901234567",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#internationalPhoneNumber-error").text()).to.contains(
            "Enter a mobile phone number in the correct format, including the country code"
          );
          expect($("#phoneNumber-error").text()).to.contains("");
        })
        .expect(400)
    );
  });

  it("should redirect to /check-your-phone page when valid international phone number entered", async () => {
    nock(baseApi)
      .post("/send-notification")
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    await request(app, (test) =>
      test
        .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          hasInternationalPhoneNumber: true,
          internationalPhoneNumber: "+33645453322",
        })
        .expect("Location", PATH_NAMES.CHECK_YOUR_PHONE)
        .expect(302)
    );
  });

  it('should render 2hr lockout "You asked for too many codes" error page when request OTP more than 5 times', async () => {
    nock(baseApi).persist().post("/send-notification").times(6).reply(400, {
      code: ERROR_CODES.VERIFY_PHONE_NUMBER_MAX_CODES_SENT,
      success: false,
    });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          phoneNumber: "07738394991",
        })
        .expect((res) => {
          res.text.includes(
            "You asked to resend the security code too many times"
          );
        })
        .expect((res) => {
          res.text.includes("You will not be able to continue for 2 hours.");
        })
        .expect(200)
    );
  });

  it('should redirect to SECURITY_CODE_REQUEST_EXCEEDED and render the 2hr lockout "you cannot create" error page when user has exceeded the OTP request limit', async () => {
    nock(baseApi).post("/send-notification").once().reply(400, {
      code: ERROR_CODES.VERIFY_PHONE_NUMBER_CODE_REQUEST_BLOCKED,
      success: false,
    });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          phoneNumber: "07738394991",
        })
        .expect((res) => {
          res.text.includes("You cannot create a GOV.UK One Login");
        })
        .expect((res) => {
          res.text.includes("Wait 2 hours");
        })
        .expect(
          "Location",
          pathWithQueryParam(
            PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED,
            "actionType",
            "otpBlocked"
          )
        )
        .expect(302)
    );
  });
});
