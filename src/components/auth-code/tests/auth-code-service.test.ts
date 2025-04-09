import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import { authCodeService } from "../auth-code-service.js";
import type { SinonStub } from "sinon";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants.js";
import type { AuthCodeServiceInterface } from "../types.js";
import { Http } from "../../../utils/http.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
describe("authentication auth code service", () => {
  const redirectUriSentToAuth = "/redirect-uri";
  const rpSectorHostSentToAuth = "https://rp.redirect.uri";
  const isAccountCreationJourneyUserSession = true;
  const passwordResetTime = 1710335967;
  const redirectUriReturnedFromResponse =
    "/redirect-here?with-some-params=added-by-the-endpoint";
  const apiBaseUrl = "https://base-url";
  const frontendBaseUrl = "https://frontend-base-url";
  const sessionId = "sessionId";
  const apiKey = "apiKey";
  const clientSessionId = "clientSessionId";
  const sourceIp = "sourceIp";
  const persistentSessionId = "persistentSessionId";
  const auditEncodedString =
    "R21vLmd3QilNKHJsaGkvTFxhZDZrKF44SStoLFsieG0oSUY3aEhWRVtOMFRNMVw1dyInKzB8OVV5N09hOi8kLmlLcWJjJGQiK1NPUEJPPHBrYWJHP358NDg2ZDVc";

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
  let postStub: SinonStub;
  let service: AuthCodeServiceInterface;

  beforeEach(() => {
    process.env.API_KEY = apiKey;
    process.env.FRONTEND_API_BASE_URL = frontendBaseUrl;
    process.env.API_BASE_URL = apiBaseUrl;
    const httpInstance = new Http();
    service = authCodeService(httpInstance);
    getStub = sinon.stub(httpInstance.client, "get");
    postStub = sinon.stub(httpInstance.client, "post");
    getStub.resolves(axiosResponse);
    postStub.resolves(axiosResponse);
  });

  afterEach(() => {
    getStub.reset();
    postStub.reset();
    delete process.env.SUPPORT_REAUTHENTICATION;
  });

  describe("with auth orch split feature flag on", () => {
    it("it should make a post request to the orch auth endpoint with claim, state and redirect uri in the body", async () => {
      const req = createMockRequest(PATH_NAMES.AUTH_CODE);
      req.ip = sourceIp;
      req.headers = {
        "txma-audit-encoded": auditEncodedString,
        "x-forwarded-for": sourceIp,
      };
      const claim = ["phone_number", "phone_number_verified"];
      const state = "state";
      const sessionClient = {
        claim: claim,
        state: state,
        redirectUri: redirectUriSentToAuth,
        rpSectorHost: rpSectorHostSentToAuth,
      };

      const userSessionClient = {
        isAccountCreationJourney: isAccountCreationJourneyUserSession,
        passwordResetTime: passwordResetTime,
      };

      const expectedBody = {
        claims: claim,
        state: state,
        "redirect-uri": redirectUriSentToAuth,
        "rp-sector-uri": rpSectorHostSentToAuth,
        "is-new-account": isAccountCreationJourneyUserSession,
        "password-reset-time": passwordResetTime,
      };

      const result = await service.getAuthCode(
        sessionId,
        clientSessionId,
        persistentSessionId,
        sessionClient,
        userSessionClient,
        req
      );

      expect(
        postStub.calledOnceWithExactly(
          API_ENDPOINTS.ORCH_AUTH_CODE,
          expectedBody,
          {
            headers: expectedHeaders,
            proxy: sinon.match.bool,
          }
        )
      ).to.be.true;
      expect(getStub.notCalled).to.be.true;
      expect(result.data.location).to.deep.eq(redirectUriReturnedFromResponse);
    });

    it("it should make a post request to the orch auth endpoint with is reauthenticate journey true for a reauthentication journey", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "1";

      const req = createMockRequest(PATH_NAMES.AUTH_CODE);
      req.ip = sourceIp;
      req.headers = {
        "txma-audit-encoded": auditEncodedString,
        "x-forwarded-for": sourceIp,
      };
      const claim = ["phone_number", "phone_number_verified"];
      const state = "state";
      const sessionClient = {
        claim: claim,
        state: state,
        redirectUri: redirectUriSentToAuth,
        rpSectorHost: rpSectorHostSentToAuth,
      };

      const userSessionClient = {
        isAccountCreationJourney: isAccountCreationJourneyUserSession,
        passwordResetTime: passwordResetTime,
        reauthenticate: "123456",
      };

      const result = await service.getAuthCode(
        sessionId,
        clientSessionId,
        persistentSessionId,
        sessionClient,
        userSessionClient,
        req
      );

      const expectedBody = {
        claims: claim,
        state: state,
        "redirect-uri": redirectUriSentToAuth,
        "rp-sector-uri": rpSectorHostSentToAuth,
        "is-new-account": isAccountCreationJourneyUserSession,
        "password-reset-time": passwordResetTime,
        "is-reauth-journey": true,
      };

      expect(
        postStub.calledOnceWithExactly(
          API_ENDPOINTS.ORCH_AUTH_CODE,
          expectedBody,
          {
            headers: expectedHeaders,
            proxy: sinon.match.bool,
          }
        )
      ).to.be.true;
      expect(getStub.notCalled).to.be.true;
      expect(result.data.location).to.deep.eq(redirectUriReturnedFromResponse);
    });
  });
});
