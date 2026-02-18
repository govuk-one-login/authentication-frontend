import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import {
  API_ENDPOINTS,
  CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION,
  MFA_METHOD_TYPE,
  PATH_NAMES,
} from "../../../app.constants.js";
import type { NextFunction, Request, Response } from "express";
import type express from "express";
import nock from "nock";
import * as cheerio from "cheerio";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";
import { extractCsrfTokenAndCookies } from "../../../../test/helpers/csrf-helper.js";
import esmock from "esmock";
import request from "supertest";

const TEST_CONTACT_US_LINK_URL = "https://example.com/contact-us";

describe("Integration:: ipv callback", () => {
  let app: express.Application;
  let baseApi: string;

  describe("ipv callback", () => {
    before(async () => {
      baseApi = process.env.FRONTEND_API_BASE_URL;
      app = await stubMiddlewareAndCreateApp(PATH_NAMES.IPV_CALLBACK);
    });

    after(() => {
      app = undefined;
      nock.cleanAll();
      sinon.restore();
    });

    it("should redirect to GET_SECURITY_CODES when the reverification result is successful", async () => {
      nock(baseApi)
        .post(API_ENDPOINTS.REVERIFICATION_RESULT)
        .once()
        .reply(200, { success: true });

      const requestPath = PATH_NAMES.IPV_CALLBACK + "?code=12345&state=abcde";

      await request(app)
        .get(requestPath)
        .expect(302)
        .expect("Location", PATH_NAMES.GET_SECURITY_CODES);
    });

    it("should redirect to CANNOT_CHANGE_SECURITY_CODES when the reverification result is successful", async () => {
      nock(baseApi)
        .post(API_ENDPOINTS.REVERIFICATION_RESULT)
        .once()
        .reply(200, { success: false, failure_code: "no_identity_available" });

      const requestPath = PATH_NAMES.IPV_CALLBACK + "?code=12345&state=abcde";

      await request(app)
        .get(requestPath)
        .expect(302)
        .expect("Location", PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES);
    });
  });

  describe("cannot change how get security codes", () => {
    afterEach(() => {
      app = undefined;
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
  });
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
