import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { cookiesGet, cookiesPost } from "../cookies-controller";
import {
  ANALYTICS_COOKIES,
  COOKIE_CONSENT,
  COOKIES_PREFERENCES_SET,
  PATH_NAMES,
} from "../../../../app.constants";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { createMockCookieConsentService } from "../../../../../test/helpers/mock-cookie-consent-service-helper";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper";

describe("cookies controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.COOKIES_POLICY);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("cookiesGet", () => {
    it("should render cookies page", () => {
      req.headers.referer = "/last-page";

      cookiesGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith("common/cookies/index.njk");
      expect(res.locals.updated).to.equal(false);
      expect(res.locals.backUrl).to.equal("/last-page");
    });
  });

  describe("cookiesPost", () => {
    describe("where the user has consented to cookies", () => {
      it("should call res.cookie with the expected arguments and flags", () => {
        req.body.cookie_preferences = "true";

        const fakeCookieConsentService = createMockCookieConsentService(
          req.body.cookie_preferences
        );

        const consentCookieValue =
          fakeCookieConsentService.createConsentCookieValue(
            req.body.cookie_preferences === "true"
              ? COOKIE_CONSENT.ACCEPT
              : COOKIE_CONSENT.REJECT
          );

        cookiesPost(req as Request, res as Response);

        expect(res.cookie).to.have.been.calledWith(
          COOKIES_PREFERENCES_SET,
          consentCookieValue.value,
          sinon.match({
            secure: true,
            httpOnly: false,
            encode: String,
          })
        );
      });

      it("should render the page", () => {
        req.body.cookie_preferences = "true";
        req.body.originalReferer = "/page-before-1";

        cookiesPost(req as Request, res as Response);

        expect(res.render).to.have.been.calledWith("common/cookies/index.njk");
        expect(res.locals.analyticsConsent).to.equal(true);
        expect(res.locals.updated).to.equal(true);
        expect(res.locals.backUrl).to.equal("/page-before-1");
      });
    });

    describe("where the user has not consented to cookies", () => {
      it("should call res.cookie with the expected arguments and flags", () => {
        req.body.cookie_preferences = "false";

        const fakeCookieConsentService = createMockCookieConsentService(
          req.body.cookie_preferences
        );

        const consentCookieValue =
          fakeCookieConsentService.createConsentCookieValue(
            req.body.cookie_preferences === "true"
              ? COOKIE_CONSENT.ACCEPT
              : COOKIE_CONSENT.REJECT
          );

        cookiesPost(req as Request, res as Response);

        expect(res.cookie).to.have.been.calledWith(
          COOKIES_PREFERENCES_SET,
          consentCookieValue.value,
          sinon.match({
            secure: true,
            httpOnly: false,
            encode: String,
          })
        );
      });

      it("should call res.clearCookie with all analytics cookies", () => {
        const dynamicAnalyticsCookie = "_ga_UA-199064834-2";

        req.body.cookie_preferences = "false";
        req.cookies[dynamicAnalyticsCookie] = 1;

        const fakeCookieConsentService = createMockCookieConsentService(
          req.body.cookie_preferences
        );

        const consentCookieValue =
          fakeCookieConsentService.createConsentCookieValue(
            req.body.cookie_preferences === "true"
              ? COOKIE_CONSENT.ACCEPT
              : COOKIE_CONSENT.REJECT
          );

        cookiesPost(req as Request, res as Response);

        expect(res.cookie).to.have.been.calledWith(
          COOKIES_PREFERENCES_SET,
          consentCookieValue.value,
          sinon.match({
            secure: true,
            httpOnly: false,
            encode: String,
          })
        );

        ANALYTICS_COOKIES.forEach((cookieKey) => {
          expect(res.clearCookie).to.have.been.calledWith(cookieKey);
        });

        expect(res.clearCookie).to.have.been.calledWith(dynamicAnalyticsCookie);
      });

      it("should set cookie preferences when a user has opted out", () => {
        req.body.cookie_preferences = "false";
        req.cookies[COOKIES_PREFERENCES_SET] = `{"analytics":true}`;

        cookiesPost(req as Request, res as Response);

        expect(res.cookie).to.have.been.calledWith(
          COOKIES_PREFERENCES_SET,
          `{"analytics":false}`
        );
      });

      it("should set cookie preferences when a user has opted in", () => {
        req.body.cookie_preferences = "true";
        req.cookies[COOKIES_PREFERENCES_SET] = `{"analytics":false}`;

        cookiesPost(req as Request, res as Response);

        expect(res.cookie).to.have.been.calledWith(
          COOKIES_PREFERENCES_SET,
          `{"analytics":true}`
        );
      });

      it("should render the page", () => {
        req.body.cookie_preferences = "false";
        req.body.originalReferer = "/page-before-2";

        cookiesPost(req as Request, res as Response);

        expect(res.render).to.have.been.calledWith("common/cookies/index.njk");
        expect(res.locals.analyticsConsent).to.equal(false);
        expect(res.locals.updated).to.equal(true);
        expect(res.locals.backUrl).to.equal("/page-before-2");
      });
    });
  });
});
