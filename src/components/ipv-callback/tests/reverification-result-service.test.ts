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
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants.js";
import { Http } from "../../../utils/http.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
import { reverificationResultService } from "../reverification-result-service.js";
import type { ReverificationResultInterface } from "../types.js";
describe("reverification result service", () => {
  const http = new Http();
  const service: ReverificationResultInterface = reverificationResultService(http);
  let postStub: SinonStub;
  const { sessionId, clientSessionId, email, diPersistentSessionId } = commonVariables;
  const req = createMockRequest(PATH_NAMES.IPV_CALLBACK, {
    headers: requestHeadersWithIpAndAuditEncoded,
  });
  const axiosResponse = Promise.resolve({ data: {}, status: 200, statusText: "OK" });

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(http.client, "post");
    postStub.resolves(axiosResponse);
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls reverification result API", async () => {
    const result = await service.getReverificationResult(
      sessionId,
      clientSessionId,
      diPersistentSessionId,
      req,
      email,
      "12345",
      "abcdef"
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.REVERIFICATION_RESULT,
      expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
      expectedBody: { email, code: "12345", state: "abcdef" },
    };

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });
});
