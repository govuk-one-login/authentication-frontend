import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";

import { authorizeGet } from "../authorize-controller.js";
import type { CookieConsentServiceInterface } from "../../common/cookie-consent/types.js";
import {
  CHANNEL,
  COOKIE_CONSENT,
  COOKIES_PREFERENCES_SET,
  OIDC_PROMPT,
  PATH_NAMES,
} from "../../../app.constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import type {
  AuthorizeServiceInterface,
  JwtServiceInterface,
  KmsDecryptionServiceInterface,
} from "../types.js";
import { BadRequestError } from "../../../utils/error.js";
import { createMockClaims } from "./test-data.js";
import type { Claims } from "../claims-config.js";
import { getOrchToAuthExpectedClientId } from "../../../config.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { createMockCookieConsentService } from "../../../../test/helpers/mock-cookie-consent-service-helper.js";
describe("authorize controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;
  let authServiceResponseData: any;
  let fakeAuthorizeService: AuthorizeServiceInterface;
  let fakeCookieConsentService: CookieConsentServiceInterface;
  let fakeKmsDecryptionService: KmsDecryptionServiceInterface;
  let fakeJwtService: JwtServiceInterface;
  let mockClaims: Claims;

  beforeEach(() => {
    mockClaims = createMockClaims();
    req = createMockRequest(PATH_NAMES.AUTHORIZE);
    req.query = {
      client_id: getOrchToAuthExpectedClientId(),
      response_type: "code",
    };
    res = mockResponse();
    res.cookie = sinon.spy(res.cookie);
    authServiceResponseData = createAuthServiceReponseData();

    fakeAuthorizeService = mockAuthService({
      data: {
        user: {
          identityRequired: false,
          upliftRequired: false,
          authenticated: true,
        },
      },
      success: true,
    });

    fakeKmsDecryptionService = {
      decrypt: sinon.fake.returns(Promise.resolve("jwt")),
    };

    fakeJwtService = {
      getPayloadWithValidation: sinon.fake.returns(Promise.resolve(mockClaims)),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("authorizeGet", () => {
    it("should redirect to /sign-in-or-create page when no existing session for user", async () => {
      fakeAuthorizeService = mockAuthService(authServiceResponseData);

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.SIGN_IN_OR_CREATE);
    });

    it("should redirect to /sign-in-or-create page with cookie preferences set", async () => {
      req.body.cookie_preferences = "true";

      authServiceResponseData.data.user = {
        cookieConsent: COOKIE_CONSENT.ACCEPT,
      };

      fakeAuthorizeService = mockAuthService(authServiceResponseData);

      const fakeCookieConsentService = createMockCookieConsentService(
        req.body.cookie_preferences
      );

      const consentCookieValue = fakeCookieConsentService.createConsentCookieValue(
        req.body.cookie_preferences === "true"
          ? COOKIE_CONSENT.ACCEPT
          : COOKIE_CONSENT.REJECT
      );

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);

      expect(res.cookie).to.have.been.calledWith(
        COOKIES_PREFERENCES_SET,
        consentCookieValue.value,
        sinon.match({
          expires: sinon.match((date: Date) => {
            const expectedExpires = new Date(Date.now());
            expectedExpires.setFullYear(expectedExpires.getFullYear() + 1);
            return Math.abs(date.getTime() - expectedExpires.getTime()) < 1000;
          }),
          secure: true,
          httpOnly: false,
        })
      );
      expect(res.redirect).to.have.calledWith(PATH_NAMES.SIGN_IN_OR_CREATE);
    });

    it("should redirect to /sign-in-or-create page with cookie preferences set to false for a strategic app journey regardless of the user's data", async () => {
      mockClaims.channel = CHANNEL.STRATEGIC_APP;

      req.body.cookie_preferences = "true";

      authServiceResponseData.data.user = {
        cookieConsent: COOKIE_CONSENT.ACCEPT,
      };

      fakeAuthorizeService = mockAuthService(authServiceResponseData);

      const fakeCookieConsentService = createMockCookieConsentService(
        req.body.cookie_preferences
      );

      const consentCookieValue = fakeCookieConsentService.createConsentCookieValue(
        req.body.cookie_preferences === "true"
          ? COOKIE_CONSENT.ACCEPT
          : COOKIE_CONSENT.REJECT
      );

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);

      expect(res.cookie).to.have.been.calledWith(
        COOKIES_PREFERENCES_SET,
        consentCookieValue.value,
        sinon.match({
          secure: true,
          httpOnly: false,
        })
      );
      expect(res.redirect).to.have.calledWith(PATH_NAMES.SIGN_IN_OR_CREATE);
    });

    it("should redirect to /uplift page when uplift query param set and MfaType is SMS", async () => {
      authServiceResponseData.data.user = {
        upliftRequired: true,
        authenticated: true,
        mfaMethodType: "SMS",
      };
      fakeAuthorizeService = mockAuthService(authServiceResponseData);

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.UPLIFT_JOURNEY);
    });

    it("should redirect to /enter-authenticator-app-code page when uplift query param set and MfaMethodType is AUTH_APP", async () => {
      authServiceResponseData.data.user = {
        upliftRequired: true,
        authenticated: true,
        mfaMethodType: "AUTH_APP",
      };
      fakeAuthorizeService = mockAuthService(authServiceResponseData);

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE);
    });

    it("should redirect to /auth-code when existing session", async () => {
      req.session.user.isAuthenticated = true;

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.AUTH_CODE);
    });

    it("should redirect to /sign-in-or-create page when identity check required", async () => {
      authServiceResponseData.data.user = {
        identityRequired: true,
        upliftRequired: false,
        authenticated: false,
      };
      fakeAuthorizeService = mockAuthService(authServiceResponseData);

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.SIGN_IN_OR_CREATE);
    });

    it("should redirect to sign in when reauthentication is requested and user is not authenticated and support reauthenticate feature flag is on", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "1";
      mockClaims.reauthenticate = "123456";
      authServiceResponseData.data.user = {
        identityRequired: false,
        upliftRequired: false,
        authenticated: false,
        isBlockedForReauth: false,
      };
      fakeAuthorizeService = mockAuthService(authServiceResponseData);

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.ENTER_EMAIL_SIGN_IN);
    });

    it("should log user out when reauthentication is requested and support reauthenticate feature flag is on but user is blocked from reauthenticating", async () => {
      const redirectUri = "https://example.com/redirect";
      mockClaims.redirect_uri = redirectUri;

      process.env.SUPPORT_REAUTHENTICATION = "1";
      mockClaims.reauthenticate = "123456";
      authServiceResponseData.data.user = {
        identityRequired: false,
        upliftRequired: false,
        authenticated: false,
        isBlockedForReauth: true,
      };
      fakeAuthorizeService = mockAuthService(authServiceResponseData);

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(redirectUri + "?error=login_required");
    });

    //note that this is currently the same behaviour with the feature flag on or off. This will change if we decide on a different initial page for the reauth journey
    it("should redirect to sign in when reauthentication is requested and user has an existing session but support reauthenticate feature flag is off", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "0";
      mockClaims.reauthenticate = "123456";
      authServiceResponseData.data.user = {
        identityRequired: false,
        upliftRequired: false,
        authenticated: false,
      };
      fakeAuthorizeService = mockAuthService(authServiceResponseData);

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.SIGN_IN_OR_CREATE);
    });

    it("should redirect to /enter-password page when prompt is login", async () => {
      req.query.prompt = OIDC_PROMPT.LOGIN;

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.ENTER_PASSWORD);
    });

    it("should redirect to /sign-in-or-create page with _ga query param when present", async () => {
      const gaTrackingId = "2.172053219.3232.1636392870-444224.1635165988";
      authServiceResponseData.data.user = {
        identityRequired: false,
        upliftRequired: false,
        cookieConsent: COOKIE_CONSENT.ACCEPT,
        gaCrossDomainTrackingId: gaTrackingId,
      };
      fakeAuthorizeService = mockAuthService(authServiceResponseData);

      const fakeCookieConsentService = createMockCookieConsentService(
        req.body.cookie_preferences
      );

      const consentCookieValue = fakeCookieConsentService.createConsentCookieValue(
        req.body.cookie_preferences === "true"
          ? COOKIE_CONSENT.ACCEPT
          : COOKIE_CONSENT.REJECT
      );

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);

      expect(res.cookie).to.have.been.calledWith(
        COOKIES_PREFERENCES_SET,
        consentCookieValue.value,
        sinon.match({
          secure: true,
          httpOnly: false,
        })
      );
      expect(res.redirect).to.have.calledWith(
        `${PATH_NAMES.SIGN_IN_OR_CREATE}?_ga=${gaTrackingId}`
      );
    });

    it("should throw an error with level Info if the authorize service returns a code 1000 Session-Id is missing or invalid", async () => {
      const fakeAuthorizeService: AuthorizeServiceInterface = {
        start: sinon.fake.returns({
          data: {
            code: 1000,
            message: "Session-Id is missing or invalid",
          },
          success: false,
        }),
      } as unknown as AuthorizeServiceInterface;

      await assertBadRequestErrorThrownWithErrorMessage(
        async () =>
          await authorizeGet(
            fakeAuthorizeService,
            fakeCookieConsentService,
            fakeKmsDecryptionService,
            fakeJwtService
          )(req as Request, res as Response),
        "1000:Session-Id is missing or invalid",
        "Info"
      );
    });

    it("should throw an error without level property if the authorize service returns a code 1001 Request is missing parameters", async () => {
      const fakeAuthorizeService: AuthorizeServiceInterface = {
        start: sinon.fake.returns({
          data: {
            code: 1001,
            message: "Request is missing parameters",
          },
          success: false,
        }),
      } as unknown as AuthorizeServiceInterface;

      await assertBadRequestErrorThrownWithErrorMessage(
        async () =>
          await authorizeGet(
            fakeAuthorizeService,
            fakeCookieConsentService,
            fakeKmsDecryptionService,
            fakeJwtService
          )(req as Request, res as Response),
        "1001:Request is missing parameters"
      );
    });

    it("should set session fields from jwt claims", async () => {
      req.query.request = "JWE";

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);
      expect(req.session.client.name).to.equal(mockClaims.client_name);
      expect(req.session.client.cookieConsentEnabled).to.equal(
        mockClaims.cookie_consent_shared
      );
      expect(req.session.client.redirectUri).to.equal(mockClaims.redirect_uri);
      expect(req.session.client.state).to.equal(mockClaims.state);
      expect(req.session.client.isOneLoginService).to.equal(
        mockClaims.is_one_login_service
      );

      expect(req.session.client.claim).to.be.deep.equal([
        "email_verified",
        "public_subject_id",
        "email",
      ]);
    });

    it("should set session reauthenticate session field from jwt claims when claim is present", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "1";
      req.query.request = "JWE";
      mockClaims.reauthenticate = "123456";

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);
      expect(req.session.user.reauthenticate).to.equal(mockClaims.reauthenticate);
    });

    it("should not set session reauthenticate session field from jwt claims when claim is present", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "0";
      req.query.request = "JWE";
      mockClaims.reauthenticate = "123456";

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);
      expect(req.session.user.reauthenticate).to.eq(null);
    });

    it("claims should be undefined when optional claims missing", async () => {
      req.query.request = "JWE";

      delete mockClaims.claim;

      fakeJwtService = {
        getPayloadWithValidation: sinon.fake.returns(Promise.resolve(mockClaims)),
      };

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);
      expect(req.session.client.claim).to.be.equal(undefined);
    });

    it("claim should be undefined when json empty", async () => {
      req.query.request = "JWE";
      mockClaims.claim = "{}";

      fakeJwtService = {
        getPayloadWithValidation: sinon.fake.returns(Promise.resolve(mockClaims)),
      };

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);
      expect(req.session.client.claim).to.be.equal(undefined);
    });
  });

  describe("Query parameters validation", () => {
    let fakeCookieConsentService: CookieConsentServiceInterface;

    beforeEach(() => {
      fakeAuthorizeService = mockAuthService(authServiceResponseData);
      fakeCookieConsentService = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake(),
      };
    });

    it("should throw an error if response_type does not exist in the query params", async () => {
      delete req.query.response_type;

      await assertBadRequestErrorThrownWithErrorMessage(
        async () =>
          await authorizeGet(
            fakeAuthorizeService,
            fakeCookieConsentService,
            fakeKmsDecryptionService,
            fakeJwtService
          )(req as Request, res as Response),
        "Response type is not set"
      );
    });

    it("should throw an error if response_type is null in the query params", async () => {
      req.query.response_type = null as unknown as string;

      await assertBadRequestErrorThrownWithErrorMessage(
        async () =>
          await authorizeGet(
            fakeAuthorizeService,
            fakeCookieConsentService,
            fakeKmsDecryptionService,
            fakeJwtService
          )(req as Request, res as Response),
        "Response type is not set"
      );
    });

    it("should throw an error if client_id value is incorrect in the query params", async () => {
      req.query.client_id = "wrong_client id";

      await assertBadRequestErrorThrownWithErrorMessage(
        async () =>
          await authorizeGet(
            fakeAuthorizeService,
            fakeCookieConsentService,
            fakeKmsDecryptionService,
            fakeJwtService
          )(req as Request, res as Response),
        "Client ID value is incorrect"
      );
    });

    it("should set session channel session field from jwt claims when claim is present", async () => {
      req.query.request = "JWE";
      mockClaims.channel = "strategic_app";

      const fakeCookieConsentService = createMockCookieConsentService(
        req.body.cookie_preferences
      );

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);
      expect(req.session.user.channel).to.equal(mockClaims.channel);
    });

    it("should set session channel session field to default when claim is not present", async () => {
      req.query.request = "JWE";
      mockClaims.channel = undefined;

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);
      expect(req.session.user.channel).to.eq("web");
    });
  });

  it("should set session channel session field to default when claim is invalid channel", async () => {
    req.query.request = "JWE";
    mockClaims.channel = "invalid_channel";

    await authorizeGet(
      fakeAuthorizeService,
      fakeCookieConsentService,
      fakeKmsDecryptionService,
      fakeJwtService
    )(req as Request, res as Response);
    expect(req.session.user.channel).to.eq("web");
  });
  function mockAuthService(authResponseData: any): AuthorizeServiceInterface {
    return {
      start: sinon.fake.returns({
        ...authResponseData,
      }),
    } as unknown as AuthorizeServiceInterface;
  }

  function createAuthServiceReponseData(): any {
    return {
      data: {
        user: {},
      },
      success: true,
    };
  }

  async function assertBadRequestErrorThrownWithErrorMessage(
    fn: () => Promise<any>,
    errorMessage: string,
    level?: string
  ) {
    let caughtError;

    try {
      await fn();
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).to.exist; // Ensure an error was thrown
    expect(caughtError).to.be.an.instanceOf(BadRequestError);
    expect(caughtError).to.have.property("level", level);
    expect(caughtError.message).to.equal(errorMessage);
  }
});
