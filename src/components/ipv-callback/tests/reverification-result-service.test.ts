import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants";
import { Http } from "../../../utils/http";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";
import { commonVariables } from "../../../../test/helpers/common-test-variables";
import { reverificationResultService } from "../reverification-result-service";
import { ReverificationResultInterface } from "../types";

describe("reverification result service", () => {
  const http = new Http();
  const service: ReverificationResultInterface =
    reverificationResultService(http);
  let postStub: SinonStub;
  const { sessionId, clientSessionId, email, diPersistentSessionId } =
    commonVariables;
  const req = createMockRequest(PATH_NAMES.IPV_CALLBACK, {
    headers: requestHeadersWithIpAndAuditEncoded,
  });
  const axiosResponse = Promise.resolve({
    data: {},
    status: 200,
    statusText: "OK",
  });

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
      email
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.REVERIFICATION_RESULT,
      expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
      expectedBody: { email },
    };

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });
});
