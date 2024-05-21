import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import { Http } from "../../../utils/http";
import { CheckEmailFraudBlockInterface } from "../types";
import { checkEmailFraudBlockService } from "../check-email-fraud-block-service";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  commonVariables,
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";

describe("check email fraud block service", () => {
  const httpInstance = new Http();
  const service: CheckEmailFraudBlockInterface =
    checkEmailFraudBlockService(httpInstance);
  let postStub: SinonStub;

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the API to check for an email fraud block", async () => {
    const { email, sessionId, clientSessionId, ip, diPersistentSessionId } =
      commonVariables;
    const req = createMockRequest(PATH_NAMES.ROOT, {
      headers: requestHeadersWithIpAndAuditEncoded,
    });
    const axiosResponse = Promise.resolve({
      data: {},
      status: HTTP_STATUS_CODES.OK,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.CHECK_EMAIL_FRAUD_BLOCK,
      expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
      expectedBody: { email },
    };

    const result = await service.checkEmailFraudBlock(
      email,
      sessionId,
      ip,
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
