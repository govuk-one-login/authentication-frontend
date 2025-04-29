import { describe } from "mocha";
import { expect } from "chai";
import { Http } from "../../../utils/http";
import { authorizeService } from "../authorize-service";
import { sinon } from "../../../../test/utils/test-utils";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants";
import { SinonStub } from "sinon";
import { AuthorizeServiceInterface } from "../types";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";
import {
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper";
import { commonVariables } from "../../../../test/helpers/common-test-variables";

const previousSessionId = "4waJ14KA9IyxKzY7bIGIA3hUDos";

describe("authorize service", () => {
  let postStub: SinonStub;
  let service: AuthorizeServiceInterface;
  const { sessionId, clientSessionId, diPersistentSessionId } = commonVariables;
  const req = createMockRequest(PATH_NAMES.AUTHORIZE, {
    headers: requestHeadersWithIpAndAuditEncoded,
  });
  const isAuthenticated = false;
  const currentCredentialStrength = "MEDIUM_LEVEL";

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    process.env.API_BASE_URL = "another-base-url";
    const httpInstance = new Http();
    service = authorizeService(httpInstance);
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    resetApiKeyAndBaseUrlEnvVars();
    delete process.env.SUPPORT_REAUTHENTICATION;
    postStub.reset();
  });

  it("sends a request with the correct headers set to true when reauth is requested and the feature flag is set", () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";

    service.start(sessionId, clientSessionId, diPersistentSessionId, req, {
      authenticated: isAuthenticated,
      reauthenticate: "123456",
      requested_credential_strength: "Cl.Cm",
      rp_client_id: "test-client-id",
      scope: "openid",
      rp_redirect_uri: "http://example.com/redirect",
      rp_state: "1234567890",
    });

    expect(
      postStub.calledOnceWithExactly(
        API_ENDPOINTS.START,
        {
          "rp-pairwise-id-for-reauth": "123456",
          authenticated: isAuthenticated,
          requested_credential_strength: "Cl.Cm",
          client_id: "test-client-id",
          scope: "openid",
          redirect_uri: "http://example.com/redirect",
          state: "1234567890",
        },
        {
          headers: {
            ...expectedHeadersFromCommonVarsWithSecurityHeaders,
            Reauthenticate: true,
          },
          proxy: false,
        }
      )
    ).to.be.true;
  });

  it("sends a request without a reauth header when reauth is requested but the feature flag is not set", () => {
    process.env.SUPPORT_REAUTHENTICATION = "0";
    service.start(sessionId, clientSessionId, diPersistentSessionId, req, {
      authenticated: isAuthenticated,
      reauthenticate: "123456",
      requested_credential_strength: "Cl.Cm",
      rp_client_id: "test-client-id",
      scope: "openid",
      rp_redirect_uri: "http://example.com/redirect",
      rp_state: "1234567890",
    });

    expect(
      postStub.calledOnceWithExactly(
        API_ENDPOINTS.START,
        {
          authenticated: isAuthenticated,
          requested_credential_strength: "Cl.Cm",
          client_id: "test-client-id",
          scope: "openid",
          redirect_uri: "http://example.com/redirect",
          state: "1234567890",
        },
        {
          headers: { ...expectedHeadersFromCommonVarsWithSecurityHeaders },
          proxy: false,
        }
      )
    ).to.be.true;
  });

  it("sends a request without a reauth header when reauth is not requested", () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
    service.start(sessionId, clientSessionId, diPersistentSessionId, req, {
      authenticated: isAuthenticated,
      requested_credential_strength: "Cl.Cm",
      rp_client_id: "test-client-id",
      scope: "openid",
      rp_redirect_uri: "http://example.com/redirect",
      rp_state: "1234567890",
    });

    expect(
      postStub.calledOnceWithExactly(
        API_ENDPOINTS.START,
        {
          authenticated: isAuthenticated,
          requested_credential_strength: "Cl.Cm",
          client_id: "test-client-id",
          scope: "openid",
          redirect_uri: "http://example.com/redirect",
          state: "1234567890",
        },
        {
          headers: { ...expectedHeadersFromCommonVarsWithSecurityHeaders },
          proxy: false,
        }
      )
    ).to.be.true;
  });

  it("sends a request with previous session ID in the body when given", () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
    service.start(sessionId, clientSessionId, diPersistentSessionId, req, {
      authenticated: isAuthenticated,
      current_credential_strength: undefined,
      reauthenticate: undefined,
      previous_session_id: previousSessionId,
      requested_credential_strength: "Cl.Cm",
      rp_client_id: "test-client-id",
      scope: "openid",
      rp_redirect_uri: "http://example.com/redirect",
      rp_state: "1234567890",
    });

    expect(
      postStub.calledOnceWithExactly(
        API_ENDPOINTS.START,
        {
          "previous-session-id": previousSessionId,
          authenticated: isAuthenticated,
          requested_credential_strength: "Cl.Cm",
          client_id: "test-client-id",
          scope: "openid",
          redirect_uri: "http://example.com/redirect",
          state: "1234567890",
        },
        {
          headers: {
            ...expectedHeadersFromCommonVarsWithSecurityHeaders,
          },
          proxy: false,
        }
      )
    ).to.be.true;
  });

  it("sends a request with the pairwise id for reauth and previous journey id in the body when present", () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
    service.start(sessionId, clientSessionId, diPersistentSessionId, req, {
      authenticated: isAuthenticated,
      current_credential_strength: undefined,
      reauthenticate: "123456",
      previous_session_id: undefined,
      previous_govuk_signin_journey_id: "previous-journey-id",
      requested_credential_strength: "Cl.Cm",
      rp_client_id: "test-client-id",
      scope: "openid",
      rp_redirect_uri: "http://example.com/redirect",
      rp_state: "1234567890",
    });

    expect(
      postStub.calledOnceWithExactly(
        API_ENDPOINTS.START,
        {
          "rp-pairwise-id-for-reauth": "123456",
          "previous-govuk-signin-journey-id": "previous-journey-id",
          authenticated: isAuthenticated,
          requested_credential_strength: "Cl.Cm",
          client_id: "test-client-id",
          scope: "openid",
          redirect_uri: "http://example.com/redirect",
          state: "1234567890",
        },
        {
          headers: {
            ...expectedHeadersFromCommonVarsWithSecurityHeaders,
            Reauthenticate: true,
          },
          proxy: false,
        }
      )
    ).to.be.true;
  });

  it("sends a request with the current credential strength in the body when present", () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
    service.start(sessionId, clientSessionId, diPersistentSessionId, req, {
      authenticated: isAuthenticated,
      current_credential_strength: currentCredentialStrength,
      reauthenticate: undefined,
      previous_session_id: undefined,
      previous_govuk_signin_journey_id: "previous-journey-id",
      requested_credential_strength: "Cl.Cm",
      rp_client_id: "test-client-id",
      scope: "openid",
      rp_redirect_uri: "http://example.com/redirect",
      rp_state: "1234567890",
    });

    expect(
      postStub.calledOnceWithExactly(
        API_ENDPOINTS.START,
        {
          "current-credential-strength": currentCredentialStrength,
          "previous-govuk-signin-journey-id": "previous-journey-id",
          authenticated: isAuthenticated,
          requested_credential_strength: "Cl.Cm",
          client_id: "test-client-id",
          scope: "openid",
          redirect_uri: "http://example.com/redirect",
          state: "1234567890",
        },
        {
          headers: {
            ...expectedHeadersFromCommonVarsWithSecurityHeaders,
          },
          proxy: false,
        }
      )
    ).to.be.true;
  });

  it("sends a request with optional parameters when present in start request", () => {
    process.env.SUPPORT_REAUTHENTICATION = "0";
    service.start(sessionId, clientSessionId, diPersistentSessionId, req, {
      authenticated: isAuthenticated,
      reauthenticate: "123456",
      requested_level_of_confidence: "P2",
      requested_credential_strength: "Cl.Cm",
      rp_client_id: "test-client-id",
      scope: "openid",
      rp_redirect_uri: "http://example.com/redirect",
      rp_state: "1234567890",
      cookie_consent: "accept",
      _ga: "987654321",
    });

    expect(
      postStub.calledOnceWithExactly(
        API_ENDPOINTS.START,
        {
          authenticated: isAuthenticated,
          requested_level_of_confidence: "P2",
          requested_credential_strength: "Cl.Cm",
          client_id: "test-client-id",
          scope: "openid",
          redirect_uri: "http://example.com/redirect",
          state: "1234567890",
          cookie_consent: "accept",
          _ga: "987654321",
        },
        {
          headers: { ...expectedHeadersFromCommonVarsWithSecurityHeaders },
          proxy: false,
        }
      )
    ).to.be.true;
  });
});
