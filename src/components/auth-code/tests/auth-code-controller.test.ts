import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";

import { authCodeGet } from "../auth-code-controller.js";
import type { AuthCodeServiceInterface } from "../types.js";
import type { CookieConsentServiceInterface } from "../../common/cookie-consent/types.js";
import { COOKIE_CONSENT } from "../../../app.constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockRequest, mockResponse } from "mock-req-res";

describe("auth code controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  const AUTH_CODE_DUMMY_URL =
    "https://test-idp-url.com/callback?code=123-4ddkk0sdkkd-ad";

  beforeEach(() => {
    req = mockRequest({
      session: {
        client: { cookieConsentEnabled: true },
        user: { isUserAuthenticated: false },
      },
      i18n: { language: "en" },
    });

    res = mockResponse({
      locals: {
        sessionId: "sessiondid",
        clientSessionId: "sdmm",
        persistentSessionId: "snncjh",
      },
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("authCodeGet", () => {
    it("should remove the reauthenticate user session property", async () => {
      const fakeAuthCodeService: AuthCodeServiceInterface = {
        getAuthCode: sinon.fake.returns({
          data: { location: AUTH_CODE_DUMMY_URL },
          success: true,
        }),
      } as unknown as AuthCodeServiceInterface;
      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake.returns({
          cookie_consent: COOKIE_CONSENT.ACCEPT,
        }),
        createConsentCookieValue: sinon.fake(),
      };

      req.session.user.reauthenticate = "test_data";

      await authCodeGet(fakeAuthCodeService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(req.session.user.reauthenticate).to.equal(undefined);
    });

    it("should redirect to the auth code url with cookie consent param set as not-engaged", async () => {
      req.cookies = {};
      const fakeAuthCodeService: AuthCodeServiceInterface = {
        getAuthCode: sinon.fake.returns({
          data: { location: AUTH_CODE_DUMMY_URL },
          success: true,
        }),
      } as unknown as AuthCodeServiceInterface;
      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake.returns({
          cookie_consent: COOKIE_CONSENT.NOT_ENGAGED,
        }),
        createConsentCookieValue: sinon.fake(),
      };

      await authCodeGet(fakeAuthCodeService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(
        `${AUTH_CODE_DUMMY_URL}&cookie_consent=not-engaged`
      );
    });

    it("should redirect to the auth code url with cookie consent param set as accept", async () => {
      const fakeAuthCodeService: AuthCodeServiceInterface = {
        getAuthCode: sinon.fake.returns({
          data: { location: AUTH_CODE_DUMMY_URL },
          success: true,
        }),
      } as unknown as AuthCodeServiceInterface;
      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake.returns({
          cookie_consent: COOKIE_CONSENT.ACCEPT,
        }),
        createConsentCookieValue: sinon.fake(),
      };

      await authCodeGet(fakeAuthCodeService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(
        `${AUTH_CODE_DUMMY_URL}&cookie_consent=accept`
      );
    });

    it("should redirect to the auth code url with cookie consent param set as reject", async () => {
      const fakeAuthCodeService: AuthCodeServiceInterface = {
        getAuthCode: sinon.fake.returns({
          data: { location: AUTH_CODE_DUMMY_URL },
          success: true,
        }),
      } as unknown as AuthCodeServiceInterface;
      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake.returns({
          cookie_consent: COOKIE_CONSENT.REJECT,
        }),
        createConsentCookieValue: sinon.fake(),
      };

      req.session.client.crossDomainGaTrackingId =
        "2.172053219.3232.1636392870-444224.1635165988";

      await authCodeGet(fakeAuthCodeService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(
        `${AUTH_CODE_DUMMY_URL}&cookie_consent=reject`
      );
    });

    it("should redirect to the auth code url without the cookie consent param present", async () => {
      req.session.client.cookieConsentEnabled = false;

      const fakeAuthCodeService: AuthCodeServiceInterface = {
        getAuthCode: sinon.fake.returns({
          data: { location: AUTH_CODE_DUMMY_URL },
          success: true,
        }),
      } as unknown as AuthCodeServiceInterface;
      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake(),
      };

      await authCodeGet(fakeAuthCodeService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(AUTH_CODE_DUMMY_URL);
    });

    it("should redirect to auth code API endpoint with cookie consent param set as reject and no _ga param", async () => {
      req.cookies = {
        cookies_preferences_set: '{"analytics":false}',
      };

      req.session.client.cookieConsentEnabled = false;

      req.session.client.crossDomainGaTrackingId =
        "2.172053219.3232.1636392870-444224.1635165988";

      const fakeAuthCodeService: AuthCodeServiceInterface = {
        getAuthCode: sinon.fake.returns({
          data: { location: AUTH_CODE_DUMMY_URL },
          success: true,
        }),
      } as unknown as AuthCodeServiceInterface;

      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake(),
      };

      await authCodeGet(fakeAuthCodeService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(AUTH_CODE_DUMMY_URL);
    });

    it("should redirect to auth code API endpoint with cookie consent param set as accept and with the _ga param set", async () => {
      req.cookies = {
        cookies_preferences_set: '{"analytics":true}',
      };

      req.session.client.cookieConsentEnabled = true;

      const fakeAuthCodeService: AuthCodeServiceInterface = {
        getAuthCode: sinon.fake.returns({
          data: { location: AUTH_CODE_DUMMY_URL },
          success: true,
        }),
      } as unknown as AuthCodeServiceInterface;

      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake.returns({
          cookie_consent: COOKIE_CONSENT.ACCEPT,
        }),
        createConsentCookieValue: sinon.fake(),
      };

      req.session.client.crossDomainGaTrackingId =
        "2.172053219.3232.1636392870-444224.1635165988";

      await authCodeGet(fakeAuthCodeService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(
        `${AUTH_CODE_DUMMY_URL}&cookie_consent=accept&_ga=2.172053219.3232.1636392870-444224.1635165988`
      );
    });
  });
});
