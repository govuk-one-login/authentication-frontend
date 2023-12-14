import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { authorizeGet } from "../authorize-controller";
import { CookieConsentServiceInterface } from "../../common/cookie-consent/types";
import {
  COOKIE_CONSENT,
  OIDC_PROMPT,
  PATH_NAMES,
} from "../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import {
  AuthorizeServiceInterface,
  JwtServiceInterface,
  KmsDecryptionServiceInterface,
} from "../types";
import { BadRequestError } from "../../../utils/error";
import { createmockclaims } from "./test-data";
import { Claims } from "../claims-config";
import { getOrchToAuthExpectedClientId } from "../../../config";

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
    mockClaims = createmockclaims();
    req = mockRequest({
      path: PATH_NAMES.AUTHORIZE,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
      t: sinon.fake(),
      i18n: { language: "en" },
      query: {
        client_id: getOrchToAuthExpectedClientId(),
        response_type: "code",
      },
    });
    res = mockResponse();
    authServiceResponseData = createAuthServiceReponseData();

    fakeAuthorizeService = mockAuthService({
      data: {
        user: {
          consentRequired: false,
          identityRequired: false,
          upliftRequired: false,
          authenticated: true,
        },
      },
      success: true,
    });

    fakeCookieConsentService = {
      getCookieConsent: sinon.fake(),
      createConsentCookieValue: sinon.fake(),
    };

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
      authServiceResponseData.data.user = {
        cookieConsent: COOKIE_CONSENT.ACCEPT,
      };
      fakeAuthorizeService = mockAuthService(authServiceResponseData);

      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake.returns({
          value: JSON.stringify("cookieValue"),
          expiry: "cookieExpires",
        }),
      } as unknown as CookieConsentServiceInterface;

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);

      expect(res.cookie).to.have.been.called;
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

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE
      );
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

    it("should redirect to /share-info when consent required", async () => {
      authServiceResponseData.data.user = {
        consentRequired: true,
        identityRequired: false,
        upliftRequired: false,
        authenticated: true,
      };
      fakeAuthorizeService = mockAuthService(authServiceResponseData);

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.SHARE_INFO);
    });

    it("should redirect to /identity page when identity check required", async () => {
      authServiceResponseData.data.user = {
        consentRequired: false,
        identityRequired: true,
        upliftRequired: false,
        authenticated: true,
      };
      fakeAuthorizeService = mockAuthService(authServiceResponseData);

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.PROVE_IDENTITY_WELCOME
      );
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
        consentRequired: false,
        identityRequired: false,
        upliftRequired: false,
        cookieConsent: COOKIE_CONSENT.ACCEPT,
        gaCrossDomainTrackingId: gaTrackingId,
      };
      fakeAuthorizeService = mockAuthService(authServiceResponseData);

      const fakeCookieConsentService: CookieConsentServiceInterface = {
        getCookieConsent: sinon.fake(),
        createConsentCookieValue: sinon.fake.returns({
          value: JSON.stringify("cookieValue"),
          expiry: "cookieExpires",
        }),
      } as unknown as CookieConsentServiceInterface;

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);

      expect(res.cookie).to.have.been.called;
      expect(res.redirect).to.have.calledWith(
        `${PATH_NAMES.SIGN_IN_OR_CREATE}?_ga=${gaTrackingId}`
      );
    });

    it("should redirect to /doc-checking-app when doc check app user", async () => {
      authServiceResponseData.data.user = {
        authenticated: false,
        consentRequired: false,
        docCheckingAppUser: true,
      };
      fakeAuthorizeService = mockAuthService(authServiceResponseData);

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.DOC_CHECKING_APP);
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

      await expect(
        authorizeGet(
          fakeAuthorizeService,
          fakeCookieConsentService,
          fakeKmsDecryptionService,
          fakeJwtService
        )(req as Request, res as Response)
      )
        .to.eventually.be.rejectedWith("1000:Session-Id is missing or invalid")
        .and.be.an.instanceOf(BadRequestError)
        .and.have.property("level", "Info");
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

      await expect(
        authorizeGet(
          fakeAuthorizeService,
          fakeCookieConsentService,
          fakeKmsDecryptionService,
          fakeJwtService
        )(req as Request, res as Response)
      )
        .to.eventually.be.rejectedWith("1001:Request is missing parameters")
        .and.be.an.instanceOf(BadRequestError)
        .and.not.to.have.property("level");
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
      req.query.request = "JWE";
      mockClaims.reauthenticate = "123456";

      await authorizeGet(
        fakeAuthorizeService,
        fakeCookieConsentService,
        fakeKmsDecryptionService,
        fakeJwtService
      )(req as Request, res as Response);
      expect(req.session.user.reauthenticate).to.equal(
        mockClaims.reauthenticate
      );
    });

    it("claims should be undefined when optional claims missing", async () => {
      req.query.request = "JWE";

      delete mockClaims.claim;

      fakeJwtService = {
        getPayloadWithValidation: sinon.fake.returns(
          Promise.resolve(mockClaims)
        ),
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
        getPayloadWithValidation: sinon.fake.returns(
          Promise.resolve(mockClaims)
        ),
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

      await expect(
        authorizeGet(
          fakeAuthorizeService,
          fakeCookieConsentService,
          fakeKmsDecryptionService,
          fakeJwtService
        )(req as Request, res as Response)
      )
        .to.eventually.be.rejectedWith("Response type is not set")
        .and.be.an.instanceOf(BadRequestError);
    });

    it("should throw an error if response_type is null in the query params", async () => {
      req.query.response_type = null as unknown as string;

      await expect(
        authorizeGet(
          fakeAuthorizeService,
          fakeCookieConsentService,
          fakeKmsDecryptionService,
          fakeJwtService
        )(req as Request, res as Response)
      )
        .to.eventually.be.rejectedWith("Response type is not set")
        .and.be.an.instanceOf(BadRequestError);
    });

    it("should throw an error if client_id value is incorrect in the query params", async () => {
      req.query.client_id = "wrong_client id";

      await expect(
        authorizeGet(
          fakeAuthorizeService,
          fakeCookieConsentService,
          fakeKmsDecryptionService,
          fakeJwtService
        )(req as Request, res as Response)
      )
        .to.eventually.be.rejectedWith("Client ID value is incorrect")
        .and.be.an.instanceOf(BadRequestError);
    });
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
});
