import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import request from "supertest";
import * as cheerio from "cheerio";
import { PATH_NAMES } from "../../../app.constants.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";
import esmock from "esmock";
const { testPhoneNumber, testRedactedPhoneNumber } = commonVariables;

describe("Integration:: reset password resend-code-2fa sms", () => {
  let app: any;

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
              mfaMethods: buildMfaMethods({
                phoneNumber: testPhoneNumber,
                redactedPhoneNumber: testRedactedPhoneNumber,
              }),
              journey: getPermittedJourneyForPath(
                PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS
              ),
              reauthenticate: "reauth",
            };

            next();
          }),
        },
      }
    );

    process.env.SUPPORT_REAUTHENTICATION = "0";
    app = await createApp();
  });

  beforeEach(() => {
    process.env.SUPPORT_REAUTHENTICATION = "0";
  });

  after(() => {
    app = undefined;
  });

  it("should return resend code page with expected title", async () => {
    await request(app)
      .get(PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS)
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("title").text()).to.contain("Get security code");
      })
      .expect(200);
  });

  it("should return resend code page with reauth analytics properties", async () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
    await request(app)
      .get(PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS)
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("title").text()).to.contain("Get security code");
      })
      .expect(200);
  });

  it("should include the last three digits of the user's telephone number", async () => {
    await request(app)
      .get(PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS)
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($.text()).to.contain(testRedactedPhoneNumber.slice(-3));
      })
      .expect(200);
  });

  it("should state user could be locked out", async () => {
    await request(app)
      .get(PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS)
      .expect((res) => {
        const $ = cheerio.load(res.text);
        expect($.text()).to.contain("you will be locked out for 2 hours.");
      })
      .expect(200);
  });

  it("should state reauthenticating user could be signed out", async () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
    await request(app)
      .get(PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS)
      .expect((res) => {
        const $ = cheerio.load(res.text);
        expect($.text()).to.contain("you will be signed out");
      })
      .expect(200);
  });

  it("should render a back link to /reset-password-2fa-sms", async () => {
    await request(app)
      .get(PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS)
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($(".govuk-back-link").attr("href")).to.contain(
          "reset-password-2fa-sms"
        );
      })
      .expect(200);
  });
});
