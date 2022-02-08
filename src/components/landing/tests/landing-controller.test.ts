import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { landingGet } from "../landing-controller";
import { ClientInfoServiceInterface } from "../../common/client-info/types";
import { CookieConsentServiceInterface } from "../../common/cookie-consent/types";
import { COOKIE_CONSENT, PATH_NAMES } from "../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("landing controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.CHECK_YOUR_PHONE,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
      t: sinon.fake(),
      i18n: { language: "en" },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("landingGet", () => {
    it("should redirect to /sign-in-or-create page", async () => {
      const fakeClientInfoService: ClientInfoServiceInterface = {
        clientInfo: sinon.fake.returns({
          data: {
            scopes: ["openid", "profile"],
            serviceType: "MANDATORY",
            clientName: "Test client",
            cookieConsentShared: true,
          },
          success: true,
        }),
      };

      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake(),
      };

      await landingGet(fakeClientInfoService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.SIGN_IN_OR_CREATE);
    });

    it("should redirect to /sign-in-or-create page with cookie preferences set", async () => {
      req.query.cookie_consent = "accept";

      const fakeClientInfoService: ClientInfoServiceInterface = {
        clientInfo: sinon.fake.returns({
          data: {
            scopes: ["openid", "profile"],
            serviceType: "MANDATORY",
            clientName: "Test client",
            cookieConsentShared: true,
          },
          success: true,
        }),
      };

      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake.returns({
          value: JSON.stringify("cookieValue"),
          expiry: "cookieExpires",
        }),
      };

      await landingGet(fakeClientInfoService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.cookie).to.have.been.called;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.SIGN_IN_OR_CREATE);
    });

    it("should redirect to /uplift page when uplift query param set", async () => {
      req.query.uplift = "true";
      req.session.user.isAuthenticated = true;

      const fakeClientInfoService: ClientInfoServiceInterface = {
        clientInfo: sinon.fake.returns({
          data: {
            scopes: ["openid", "profile"],
            serviceType: "MANDATORY",
            clientName: "Test client",
            cookieConsentShared: true,
          },
          success: true,
        }),
      };

      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake(),
      };

      await landingGet(fakeClientInfoService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.UPLIFT_JOURNEY);
    });

    it("should redirect to /auth-code when existing session", async () => {
      req.session.user.isAuthenticated = true;

      const fakeClientInfoService: ClientInfoServiceInterface = {
        clientInfo: sinon.fake.returns({
          data: {
            scopes: ["openid", "profile"],
            serviceType: "MANDATORY",
            clientName: "Test client",
            cookieConsentShared: true,
          },
          success: true,
        }),
      };

      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake(),
      };

      await landingGet(fakeClientInfoService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.AUTH_CODE);
    });

    it("should redirect to /share-info when consent query param set", async () => {
      req.session.user.isAuthenticated = true;
      req.query.consent = "true";

      const fakeClientInfoService: ClientInfoServiceInterface = {
        clientInfo: sinon.fake.returns({
          data: {
            scopes: ["openid", "profile"],
            serviceType: "MANDATORY",
            clientName: "Test client",
            cookieConsentShared: true,
          },
          success: true,
        }),
      };

      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake(),
      };

      await landingGet(fakeClientInfoService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.SHARE_INFO);
    });

    it("should redirect to /identity page when query param set", async () => {
      req.query.identity = "true";
      req.session.user.isAuthenticated = true;

      const fakeClientInfoService: ClientInfoServiceInterface = {
        clientInfo: sinon.fake.returns({
          data: {
            scopes: ["openid", "profile"],
            serviceType: "MANDATORY",
            clientName: "Test client",
            cookieConsentShared: true,
          },
          success: true,
        }),
      };

      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake(),
      };

      await landingGet(fakeClientInfoService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.PROVE_IDENTITY);
    });

    it("should redirect to /sign-in-or-create page _ga query param when present", async () => {
      req.query.consent = "true";
      req.query.cookie_consent = COOKIE_CONSENT.ACCEPT;
      req.session.client.consentEnabled = true;
      req.query._ga = "2.172053219.3232.1636392870-444224.1635165988";

      const fakeClientInfoService: ClientInfoServiceInterface = {
        clientInfo: sinon.fake.returns({
          data: {
            scopes: ["openid", "profile"],
            serviceType: "MANDATORY",
            clientName: "Test client",
            cookieConsentShared: true,
          },
          success: true,
        }),
      };

      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake.returns({
          value: JSON.stringify("cookieValue"),
          expiry: "cookieExpires",
        }),
      };

      await landingGet(fakeClientInfoService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.cookie).to.have.been.called;
      expect(res.redirect).to.have.calledWith(
        `${PATH_NAMES.SIGN_IN_OR_CREATE}?_ga=2.172053219.3232.1636392870-444224.1635165988`
      );
    });
  });
});
