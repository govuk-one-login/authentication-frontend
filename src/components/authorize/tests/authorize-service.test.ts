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

const oldSessionId = "4waJ14KA9IyxKzY7bIGIA3hUDos";

describe("authorize service", () => {
  let postStub: SinonStub;
  let service: AuthorizeServiceInterface;
  const { sessionId, clientSessionId, diPersistentSessionId } = commonVariables;
  const req = createMockRequest(PATH_NAMES.AUTHORIZE, {
    headers: requestHeadersWithIpAndAuditEncoded,
  });

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
    service.start(
      sessionId,
      clientSessionId,
      diPersistentSessionId,
      req,
      "123456"
    );

    expect(
      postStub.calledOnceWithExactly(
        API_ENDPOINTS.START,
        {},
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
    service.start(
      sessionId,
      clientSessionId,
      diPersistentSessionId,
      req,
      "123456"
    );

    expect(
      postStub.calledOnceWithExactly(
        API_ENDPOINTS.START,
        {},
        {
          headers: { ...expectedHeadersFromCommonVarsWithSecurityHeaders },
          proxy: false,
        }
      )
    ).to.be.true;
  });

  it("sends a request without a reauth header when reauth is not requested", () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
    service.start(sessionId, clientSessionId, diPersistentSessionId, req);

    expect(
      postStub.calledOnceWithExactly(
        API_ENDPOINTS.START,
        {},
        {
          headers: { ...expectedHeadersFromCommonVarsWithSecurityHeaders },
          proxy: false,
        }
      )
    ).to.be.true;
  });

  it("sends a request with old session ID in the body when given", () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
    service.start(
      sessionId,
      clientSessionId,
      diPersistentSessionId,
      req,
      undefined,
      oldSessionId
    );

    expect(
      postStub.calledOnceWithExactly(
        API_ENDPOINTS.START,
        { "old-session-id": oldSessionId },
        {
          headers: {
            ...expectedHeadersFromCommonVarsWithSecurityHeaders,
          },
          proxy: false,
        }
      )
    ).to.be.true;
  });
});
