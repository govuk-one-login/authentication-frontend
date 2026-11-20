import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import {
  CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION,
  MFA_METHOD_TYPE,
  PATH_NAMES,
} from "../../../app.constants.js";
import type { NextFunction, Request, Response } from "express";
import type express from "express";
import * as cheerio from "cheerio";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";
import { extractCsrfTokenAndCookies } from "../../../../test/helpers/csrf-helper.js";
import esmock from "esmock";
import request from "supertest";

const TEST_CONTACT_US_LINK_URL = "https://example.com/contact-us";

describe("Integration:: cannot change security codes", () => {

  afterEach(() => {
    sinon.restore();
  });

    it("returns a validation error when no option is selected", async () => {
      const app = await stubMiddlewareAndCreateApp(
        PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES
      );
      const { token, cookies } =
        await getCannotChangeSecurityCodesAndReturnTokenAndCookies(app);

      await request(app)
        .post(PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          cannotChangeHowGetSecurityCodeAction: "",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect(
            $("#cannotChangeHowGetSecurityCodeAction-error").text()
          ).to.contains("Select what you would like to do");
          expect($(".govuk-error-summary__list").text()).to.contains(
            "Select what you would like to do"
          );
        })
        .expect(400);
    });

    it("keeps the identity failed content when there is a validation error on the identity fail page", async () => {
      const app = await stubMiddlewareAndCreateApp(
        PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL
      );
      const { token, cookies } = extractCsrfTokenAndCookies(
        await request(app).get(
          PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL
        )
      );

      await request(app)
        .post(PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          cannotChangeHowGetSecurityCodeAction: "",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("main").text()).to.contains(
            "This is because there was a problem confirming your identity."
          );
        })
        .expect(400);
    });

    it("goes to support page when user selects help-to-delete-account radio button", async () => {
      const app = await stubMiddlewareAndCreateApp(
        PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES
      );
      const { token, cookies } =
        await getCannotChangeSecurityCodesAndReturnTokenAndCookies(app);

      await request(app)
        .post(PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          cannotChangeHowGetSecurityCodeAction:
            CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.HELP_DELETE_ACCOUNT,
        })
        .expect("Location", TEST_CONTACT_US_LINK_URL)
        .expect(302);
    });

    it("goes to /enter-code when user selects retry-security-code radio button and their mfaMethodType is SMS", async () => {
      const app = await stubMiddlewareAndCreateApp(
        PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES,
        MFA_METHOD_TYPE.SMS
      );
      const { token, cookies } =
        await getCannotChangeSecurityCodesAndReturnTokenAndCookies(app);

      await request(app)
        .post(PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          cannotChangeHowGetSecurityCodeAction:
            CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.RETRY_SECURITY_CODE,
        })
        .expect("Location", PATH_NAMES.ENTER_MFA)
        .expect(302);
    });

    it("goes to /enter-authenticator-app-code when user selects retry-security-code radio button and their mfaMethodType is AUTH_APP", async () => {
      const app = await stubMiddlewareAndCreateApp(
        PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES,
        MFA_METHOD_TYPE.AUTH_APP
      );
      const { token, cookies } =
        await getCannotChangeSecurityCodesAndReturnTokenAndCookies(app);

      await request(app)
        .post(PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          cannotChangeHowGetSecurityCodeAction:
            CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.RETRY_SECURITY_CODE,
        })
        .expect("Location", PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
        .expect(302);
    });

    it("should render onlyDeleteAccount variant and redirect to support when needsForcedMFAReset is true", async () => {
      const app = await stubMiddlewareAndCreateApp(
        PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES,
        undefined,
        true
      );

      await request(app)
        .get(PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES)
        .expect(200)
        .then((res) => {
          const $ = cheerio.load(res.text);
          expect($("h1").text()).to.contain(
            "You cannot change how you get security codes"
          );
          expect(
            $(
              "form input[name='cannotChangeHowGetSecurityCodeAction'][type='hidden']"
            ).val()
          ).to.equal("help-to-delete-account");
          expect(
            $("#radio-cannot-change-how-get-security-code-action").length
          ).to.equal(0);
        });

      const { token, cookies } =
        await getCannotChangeSecurityCodesAndReturnTokenAndCookies(app);

      await request(app)
        .post(PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          cannotChangeHowGetSecurityCodeAction:
            CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.HELP_DELETE_ACCOUNT,
        })
        .expect("Location", TEST_CONTACT_US_LINK_URL)
        .expect(302);
    });

    it("should render the cannot-change-security-codes template from /cannot-change-security-codes-no-identity-delete", async () => {
      const app = await stubMiddlewareAndCreateApp(
        PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_NO_IDENTITY_DELETE,
        MFA_METHOD_TYPE.SMS
      );

      await request(app)
        .get(PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_NO_IDENTITY_DELETE)
        .expect(200)
        .then((res) => {
          const $ = cheerio.load(res.text);
          expect($("h1").text()).to.contain(
            "You cannot change how you get security codes"
          );
          const radioText = $(
            "#radio-cannot-change-how-get-security-code-action"
          ).text();
          expect(radioText).to.contains("Get help to delete");
          expect(radioText).to.contains("Try entering a security code again");
    })})
});

const stubMiddlewareAndCreateApp = async (
  nextPath: string,
  mfaMethodType?: MFA_METHOD_TYPE,
  needsForcedMFAReset?: boolean
): Promise<express.Application> => {
  const { createApp } = await esmock(
    "../../../app.js",
    {},
    {
      "../../../config.js": {
        getSessionSecret: () => "test-session-secret",
      },
      "../../../middleware/session-middleware.js": {
        validateSessionMiddleware: sinon.fake(function (
          req: Request,
          res: Response,
          next: NextFunction
        ): void {
          res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

          req.session.user = {
            email: "test@test.com",
            mfaMethods: buildMfaMethods({ phoneNumber: "7867" }),
            journey: getPermittedJourneyForPath(nextPath),
            mfaMethodType: mfaMethodType,
            needsForcedMFAReset: needsForcedMFAReset,
            isMfaRequired: true,
          };

          next();
        }),
      },
      "../../../middleware/outbound-contact-us-links-middleware.js": {
        outboundContactUsLinksMiddleware: sinon.fake(function (
          req: Request,
          res: Response,
          next: NextFunction
        ): void {
          res.locals.contactUsLinkUrl = TEST_CONTACT_US_LINK_URL;

          next();
        }),
      },
    }
  );

  return await createApp();
};

const getCannotChangeSecurityCodesAndReturnTokenAndCookies = async (
  app: express.Application
) => {
  return extractCsrfTokenAndCookies(
    await request(app).get(PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES)
  );
};
