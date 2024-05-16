import { describe } from "mocha";
import { expect } from "chai";
import { Http } from "../../../utils/http";
import { authorizeService } from "../authorize-service";
import { sinon } from "../../../../test/utils/test-utils";
import { API_ENDPOINTS } from "../../../app.constants";
import { SinonStub } from "sinon";
import { AuthorizeServiceInterface } from "../types";

describe("authorize service", () => {
  const sessionId = "some-session-id";
  const clientSessionId = "client-session-id";
  const ip = "123.123.123.123";
  const persistentSessionId = "persistent-session-id";
  const apiKey = "api-key";
  const expectedHeaders = {
    "X-API-Key": apiKey,
    "Session-Id": sessionId,
    "Client-Session-Id": clientSessionId,
    "X-Forwarded-For": ip,
    "di-persistent-session-id": persistentSessionId,
  };
  let getStub: SinonStub;
  let service: AuthorizeServiceInterface;

  beforeEach(() => {
    process.env.API_KEY = apiKey;
    process.env.FRONTEND_API_BASE_URL = "some-base-url";
    process.env.API_BASE_URL = "another-base-url";
    const httpInstance = new Http();
    service = authorizeService(httpInstance);
    getStub = sinon.stub(httpInstance.client, "get");
  });

  afterEach(() => {
    getStub.reset();
  });

  it("sends a request with the reauth header set to true when reauth is requested and the feature flag is set", () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
    service.start(
      sessionId,
      clientSessionId,
      ip,
      persistentSessionId,
      "123456"
    );

    expect(
      getStub.calledWithMatch(API_ENDPOINTS.START, {
        headers: { ...expectedHeaders, Reauthenticate: true },
        proxy: false,
      })
    ).to.be.true;
  });

  it("sends a request without a reauth header when reauth is requested but the feature flag is not set", () => {
    process.env.SUPPORT_REAUTHENTICATION = "0";
    service.start(
      sessionId,
      clientSessionId,
      ip,
      persistentSessionId,
      "123456"
    );

    expect(
      getStub.calledWithMatch(API_ENDPOINTS.START, {
        headers: { ...expectedHeaders, Reauthenticate: undefined },
        proxy: false,
      })
    ).to.be.true;
  });

  it("sends a request without a reauth header when reauth is not requested", () => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
    service.start(sessionId, clientSessionId, ip, persistentSessionId);

    expect(
      getStub.calledWithMatch(API_ENDPOINTS.START, {
        headers: { ...expectedHeaders, Reauthenticate: undefined },
        proxy: false,
      })
    ).to.be.true;
  });
});
