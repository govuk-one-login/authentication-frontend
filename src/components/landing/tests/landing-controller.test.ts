import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { landingGet } from "../landing-controller";
import { CookieConsentServiceInterface } from "../../common/cookie-consent/types";
import { COOKIE_CONSENT, PATH_NAMES } from "../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { LandingServiceInterface } from "../types";
import { BadRequestError } from "../../../utils/error";

describe("landing controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.START,
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
    it("should redirect to /sign-in-or-create page when no existing session for user", async () => {
      const fakeLandingService: LandingServiceInterface = {
        start: sinon.fake.returns({
          data: {
            client: {
              scopes: ["openid", "profile"],
              serviceType: "MANDATORY",
              clientName: "Test client",
              cookieConsentShared: true,
            },
            user: {},
          },
          success: true,
        }),
      };

      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake(),
      };

      await landingGet(fakeLandingService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.SIGN_IN_OR_CREATE);
    });

    it("should redirect to /sign-in-or-create page with cookie preferences set", async () => {
      const fakeLandingService: LandingServiceInterface = {
        start: sinon.fake.returns({
          data: {
            client: {
              scopes: ["openid", "profile"],
              serviceType: "MANDATORY",
              clientName: "Test client",
              cookieConsentShared: true,
            },
            user: { cookieConsent: COOKIE_CONSENT.ACCEPT },
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

      await landingGet(fakeLandingService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.cookie).to.have.been.called;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.SIGN_IN_OR_CREATE);
    });

    it("should redirect to /uplift page when uplift query param set", async () => {
      const fakeLandingService: LandingServiceInterface = {
        start: sinon.fake.returns({
          data: {
            client: {
              scopes: ["openid", "profile"],
              serviceType: "MANDATORY",
              clientName: "Test client",
              cookieConsentShared: true,
            },
            user: { upliftRequired: true, authenticated: true },
          },
          success: true,
        }),
      };

      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake(),
      };

      await landingGet(fakeLandingService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.UPLIFT_JOURNEY);
    });

    it("should redirect to /auth-code when existing session", async () => {
      req.session.user.isAuthenticated = true;

      const fakeLandingService: LandingServiceInterface = {
        start: sinon.fake.returns({
          data: {
            client: {
              scopes: ["openid", "profile"],
              serviceType: "MANDATORY",
              clientName: "Test client",
              cookieConsentShared: true,
            },
            user: {
              consentRequired: false,
              identityRequired: false,
              upliftRequired: false,
              authenticated: true,
            },
          },
          success: true,
        }),
      };

      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake(),
      };

      await landingGet(fakeLandingService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.AUTH_CODE);
    });

    it("should redirect to /share-info when consent required", async () => {
      const fakeLandingService: LandingServiceInterface = {
        start: sinon.fake.returns({
          data: {
            client: {
              scopes: ["openid", "profile"],
              serviceType: "MANDATORY",
              clientName: "Test client",
              cookieConsentShared: true,
            },
            user: {
              consentRequired: true,
              identityRequired: false,
              upliftRequired: false,
              authenticated: true,
            },
          },
          success: true,
        }),
      };

      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake(),
      };

      await landingGet(fakeLandingService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.SHARE_INFO);
    });

    it("should redirect to /identity page when identity check required", async () => {
      const fakeLandingService: LandingServiceInterface = {
        start: sinon.fake.returns({
          data: {
            client: {
              scopes: ["openid", "profile"],
              serviceType: "MANDATORY",
              clientName: "Test client",
              cookieConsentShared: true,
            },
            user: {
              consentRequired: false,
              identityRequired: true,
              upliftRequired: false,
              authenticated: true,
            },
          },
          success: true,
        }),
      };

      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake(),
      };

      await landingGet(fakeLandingService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.PROVE_IDENTITY);
    });

    it("should redirect to /enter-password page when prompt is login", async () => {
      req.query.prompt = "LOGIN";

      const fakeLandingService: LandingServiceInterface = {
        start: sinon.fake.returns({
          data: {
            client: {
              scopes: ["openid", "profile"],
              serviceType: "MANDATORY",
              clientName: "Test client",
              cookieConsentShared: true,
            },
            user: {
              consentRequired: false,
              identityRequired: false,
              upliftRequired: false,
              authenticated: true,
            },
          },
          success: true,
        }),
      };

      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake(),
      };

      await landingGet(fakeLandingService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.ENTER_PASSWORD);
    });

    it("should redirect to /sign-in-or-create page with _ga query param when present", async () => {
      const gaTrackingId = "2.172053219.3232.1636392870-444224.1635165988";
      const fakeLandingService: LandingServiceInterface = {
        start: sinon.fake.returns({
          data: {
            client: {
              scopes: ["openid", "profile"],
              serviceType: "MANDATORY",
              clientName: "Test client",
              cookieConsentShared: true,
              consentEnabled: true,
            },
            user: {
              consentRequired: false,
              identityRequired: false,
              upliftRequired: false,
              cookieConsent: COOKIE_CONSENT.ACCEPT,
              gaCrossDomainTrackingId: gaTrackingId,
            },
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

      await landingGet(fakeLandingService, fakeCookieConsentService)(
        req as Request,
        res as Response
      );

      expect(res.cookie).to.have.been.called;
      expect(res.redirect).to.have.calledWith(
        `${PATH_NAMES.SIGN_IN_OR_CREATE}?_ga=${gaTrackingId}`
      );
    });
  });

  it("should throw an error with level Info if the landing service returns a code 1000 Session-Id is missing or invalid", async () => {
    const fakeLandingService: LandingServiceInterface = {
      start: sinon.fake.returns({
        data: {
          code: 1000,
          message: "Session-Id is missing or invalid",
        },
        success: false,
      }),
    };

    const fakeCookieConsentService: CookieConsentServiceInterface = {
      getCookieConsent: sinon.fake(),
      createConsentCookieValue: sinon.fake(),
    };

    await expect(
      landingGet(fakeLandingService, fakeCookieConsentService)(
        req as Request,
        res as Response
      )
    )
      .to.eventually.be.rejectedWith("1000:Session-Id is missing or invalid")
      .and.be.an.instanceOf(BadRequestError)
      .and.have.property("level", "Info");
  });

  it("should throw an error without level property if the landing service returns a code 1001 Request is missing parameters", async () => {
    const fakeLandingService: LandingServiceInterface = {
      start: sinon.fake.returns({
        data: {
          code: 1001,
          message: "Request is missing parameters",
        },
        success: false,
      }),
    };

    const fakeCookieConsentService: CookieConsentServiceInterface = {
      getCookieConsent: sinon.fake(),
      createConsentCookieValue: sinon.fake(),
    };

    await expect(
      landingGet(fakeLandingService, fakeCookieConsentService)(
        req as Request,
        res as Response
      )
    )
      .to.eventually.be.rejectedWith("1001:Request is missing parameters")
      .and.be.an.instanceOf(BadRequestError)
      .and.not.to.have.property("level");
  });
});
