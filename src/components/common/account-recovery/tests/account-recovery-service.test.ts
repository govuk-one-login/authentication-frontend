import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import { Http } from "../../../../utils/http";
import { AccountRecoveryInterface } from "../types";
import { accountRecoveryService } from "../account-recovery-service";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../../test/helpers/service-test-helper";
import { API_ENDPOINTS, PATH_NAMES } from "../../../../app.constants";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper";
import { commonVariables } from "../../../../../test/helpers/common-test-variables";

describe("account recovery service", () => {
  const httpInstance = new Http();
  const service: AccountRecoveryInterface =
    accountRecoveryService(httpInstance);
  let postStub: SinonStub;

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the API to perform an account recovery request", async () => {
    const { sessionId, clientSessionId, email, diPersistentSessionId } =
      commonVariables;
    const req = createMockRequest(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE, {
      headers: requestHeadersWithIpAndAuditEncoded,
    });
    const axiosResponse = Promise.resolve({
      data: {},
      status: 200,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);

    const result = await service.accountRecovery(
      sessionId,
      clientSessionId,
      email,
      diPersistentSessionId,
      req
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.ACCOUNT_RECOVERY,
      expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
      expectedBody: { email: commonVariables.email },
    };

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });
});
