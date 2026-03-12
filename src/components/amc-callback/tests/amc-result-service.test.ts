import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import { amcResultService } from "../amc-result-service.js";
import type { SinonStub } from "sinon";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants.js";
import { Http } from "../../../utils/http.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";

describe("amc result service", () => {
  const sessionId = "sessionId";
  const clientSessionId = "clientSessionId";
  const persistentSessionId = "persistentSessionId";
  const sourceIp = "127.0.0.1";
  const code = "auth-code";
  const state = "state-value";
  const apiKey = "apiKey";
  const auditEncodedString = "audit-encoded-string";
  const language = "en";

  const expectedHeaders = {
    "X-API-Key": apiKey,
    "Session-Id": sessionId,
    "Client-Session-Id": clientSessionId,
    "x-forwarded-for": sourceIp,
    "txma-audit-encoded": auditEncodedString,
    "di-persistent-session-id": persistentSessionId,
    "User-Language": language,
  };

  const axiosResponse = Promise.resolve({
    data: "success",
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
  });

  let postStub: SinonStub;

  beforeEach(() => {
    process.env.API_KEY = apiKey;
    const httpInstance = new Http();
    postStub = sinon.stub(httpInstance.client, "post");
    postStub.resolves(axiosResponse);
  });

  afterEach(() => {
    postStub.reset();
  });

  it("should make a post request to AMC callback endpoint with code and state", async () => {
    const httpInstance = new Http();
    const service = amcResultService(httpInstance);
    postStub = sinon.stub(httpInstance.client, "post").resolves(axiosResponse);

    const req = createMockRequest(PATH_NAMES.AMC_CALLBACK);
    req.ip = sourceIp;
    req.headers = {
      "txma-audit-encoded": auditEncodedString,
      "x-forwarded-for": sourceIp,
    };

    const result = await service.getAMCResult(
      sessionId,
      clientSessionId,
      persistentSessionId,
      req,
      code,
      state,
      language
    );

    expect(
      postStub.calledOnceWithExactly(
        API_ENDPOINTS.AMC_CALLBACK,
        { code, state },
        {
          headers: expectedHeaders,
          proxy: sinon.match.bool,
        }
      )
    ).to.be.true;
    expect(result.data).to.eq("success");
  });
});
