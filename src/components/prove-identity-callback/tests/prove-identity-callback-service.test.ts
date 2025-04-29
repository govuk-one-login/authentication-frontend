import { describe } from "mocha";
import type { SinonStub } from "sinon";
import sinon from "sinon";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper.js";
import { Http } from "../../../utils/http.js";
import type { ProveIdentityCallbackServiceInterface } from "../types.js";
import { proveIdentityCallbackService } from "../prove-identity-callback-service.js";
import {
  API_ENDPOINTS,
  COOKIE_CONSENT,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
import { expect } from "chai";
import type { CookieConsentServiceInterface } from "../../common/cookie-consent/types.js";
import type { Request } from "express";

describe("prove identity callback service", () => {
  const httpInstance = new Http();
  const service: ProveIdentityCallbackServiceInterface =
    proveIdentityCallbackService(httpInstance);

  describe("processIdentity", () => {
    let postStub: SinonStub;

    beforeEach(() => {
      setupApiKeyAndBaseUrlEnvVars();
      postStub = sinon.stub(httpInstance.client, "post");
    });

    afterEach(() => {
      postStub.reset();
      resetApiKeyAndBaseUrlEnvVars();
    });

    it("successfully calls the API to make a request to process an identity", async () => {
      const axiosResponse = Promise.resolve({
        data: {},
        status: HTTP_STATUS_CODES.OK,
        statusText: "OK",
      });
      postStub.resolves(axiosResponse);
      const { email, sessionId, clientSessionId, diPersistentSessionId } =
        commonVariables;
      const req = createMockRequest("/testPath", {
        headers: requestHeadersWithIpAndAuditEncoded,
      });

      const expectedApiCallDetails = {
        expectedPath: API_ENDPOINTS.IPV_PROCESSING_IDENTITY,
        expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
        expectedBody: { email },
      };

      const result = await service.processIdentity(
        email,
        sessionId,
        clientSessionId,
        diPersistentSessionId,
        req
      );

      checkApiCallMadeWithExpectedBodyAndHeaders(
        result,
        postStub,
        true,
        expectedApiCallDetails
      );
    });
  });

  describe("generateSuccessfulRpReturnUrl", () => {
    const redirectUriReturnedFromResponse =
      "/redirect-here?with-some-params=added-by-the-endpoint";
    const apiBaseUrl = "https://base-url";
    const sessionId = "sessionId";
    const apiKey = "apiKey";
    const clientSessionId = "clientSessionId";
    const sourceIp = "sourceIp";
    const persistentSessionId = "persistentSessionId";
    const auditEncodedString =
      "R21vLmd3QilNKHJsaGkvTFxhZDZrKF44SStoLFsieG0oSUY3aEhWRVtOMFRNMVw1dyInKzB8OVV5N09hOi8kLmlLcWJjJGQiK1NPUEJPPHBrYWJHP358NDg2ZDVc";
    const crossDomainGaTrackingId =
      "2.172053219.3232.1636392870-444224.1635165988";
    const expectedHeaders = {
      "X-API-Key": apiKey,
      "Session-Id": sessionId,
      "Client-Session-Id": clientSessionId,
      "x-forwarded-for": sourceIp,
      "txma-audit-encoded": auditEncodedString,
      "di-persistent-session-id": persistentSessionId,
    };
    const axiosResponse = Promise.resolve({
      data: {
        location: redirectUriReturnedFromResponse,
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });
    let getStub: SinonStub;
    let req = {} as any as Request;

    beforeEach(() => {
      process.env.API_BASE_URL = apiBaseUrl;
      getStub = sinon.stub(httpInstance.client, "get");
      getStub.resolves(axiosResponse);
      req = createMockRequest(PATH_NAMES.PROVE_IDENTITY_CALLBACK);
      req.ip = sourceIp;
      req.headers = {
        "txma-audit-encoded": auditEncodedString,
        "x-forwarded-for": sourceIp,
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    it("should make a request for an RP auth code", async () => {
      const result = await service.generateSuccessfulRpReturnUrl(
        sessionId,
        clientSessionId,
        persistentSessionId,
        req
      );

      expect(
        getStub.calledOnceWithExactly(API_ENDPOINTS.AUTH_CODE, {
          headers: expectedHeaders,
          baseURL: apiBaseUrl,
          proxy: sinon.match.bool,
        })
      ).to.be.true;
      expect(result).to.eq(redirectUriReturnedFromResponse);
    });

    describe("cookieConsentEnabled true", () => {
      beforeEach(() => {
        req.session.client.cookieConsentEnabled = true;
      });

      it("should redirect to the auth code url with cookie consent param set as not-engaged", async () => {
        const fakeCookieConsentService =
          createFakeCookieConsentService("NOT_ENGAGED");

        const result = await proveIdentityCallbackService(
          httpInstance,
          fakeCookieConsentService
        ).generateSuccessfulRpReturnUrl(
          sessionId,
          clientSessionId,
          persistentSessionId,
          req
        );

        expect(result).to.eq(
          `${redirectUriReturnedFromResponse}&cookie_consent=not-engaged`
        );
      });

      it("should redirect to the auth code url with cookie consent param set as accept", async () => {
        const fakeCookieConsentService =
          createFakeCookieConsentService("ACCEPT");

        const result = await proveIdentityCallbackService(
          httpInstance,
          fakeCookieConsentService
        ).generateSuccessfulRpReturnUrl(
          sessionId,
          clientSessionId,
          persistentSessionId,
          req
        );

        expect(result).to.eq(
          `${redirectUriReturnedFromResponse}&cookie_consent=accept`
        );
      });

      it("should redirect to the auth code url with cookie consent param set as reject", async () => {
        const fakeCookieConsentService =
          createFakeCookieConsentService("REJECT");
        req.session.client.crossDomainGaTrackingId = crossDomainGaTrackingId;

        const result = await proveIdentityCallbackService(
          httpInstance,
          fakeCookieConsentService
        ).generateSuccessfulRpReturnUrl(
          sessionId,
          clientSessionId,
          persistentSessionId,
          req
        );

        expect(
          getStub.calledOnceWithExactly(API_ENDPOINTS.AUTH_CODE, {
            headers: expectedHeaders,
            baseURL: apiBaseUrl,
            proxy: sinon.match.bool,
          })
        ).to.be.true;
        expect(result).to.eq(
          `${redirectUriReturnedFromResponse}&cookie_consent=reject`
        );
      });

      it("should redirect to auth code url with cookie consent param set as accept and with the _ga param set", async () => {
        req.session.client.cookieConsentEnabled = true;
        req.session.client.crossDomainGaTrackingId = crossDomainGaTrackingId;

        const fakeCookieConsentService =
          createFakeCookieConsentService("ACCEPT");

        const result = await proveIdentityCallbackService(
          httpInstance,
          fakeCookieConsentService
        ).generateSuccessfulRpReturnUrl(
          sessionId,
          clientSessionId,
          persistentSessionId,
          req
        );

        expect(
          getStub.calledOnceWithExactly(API_ENDPOINTS.AUTH_CODE, {
            headers: expectedHeaders,
            baseURL: apiBaseUrl,
            proxy: sinon.match.bool,
          })
        ).to.be.true;
        expect(result).to.eq(
          `${redirectUriReturnedFromResponse}&cookie_consent=accept&_ga=${crossDomainGaTrackingId}`
        );
      });
    });

    describe("cookieConsentEnabled false", () => {
      beforeEach(() => {
        req.session.client.cookieConsentEnabled = false;
      });

      it("should redirect to auth code url with cookie consent param set as reject and no _ga param", async () => {
        req.session.client.crossDomainGaTrackingId = crossDomainGaTrackingId;

        const fakeCookieConsentService =
          createFakeCookieConsentService("REJECT");

        const result = await proveIdentityCallbackService(
          httpInstance,
          fakeCookieConsentService
        ).generateSuccessfulRpReturnUrl(
          sessionId,
          clientSessionId,
          persistentSessionId,
          req
        );

        expect(
          getStub.calledOnceWithExactly(API_ENDPOINTS.AUTH_CODE, {
            headers: expectedHeaders,
            baseURL: apiBaseUrl,
            proxy: sinon.match.bool,
          })
        ).to.be.true;
        expect(result).to.eq(`${redirectUriReturnedFromResponse}`);
      });
    });
  });
});

function createFakeCookieConsentService(
  consent: keyof typeof COOKIE_CONSENT
): CookieConsentServiceInterface {
  return {
    getCookieConsent: sinon.fake.returns({
      cookie_consent: COOKIE_CONSENT[consent],
    }),
    createConsentCookieValue: sinon.fake(),
  };
}
