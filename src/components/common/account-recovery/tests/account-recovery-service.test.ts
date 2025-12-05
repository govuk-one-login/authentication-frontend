import { describe } from "mocha";
import type { SinonStub } from "sinon";
import sinon from "sinon";
import { Http } from "../../../../utils/http.js";
import type { AccountRecoveryInterface } from "../types.js";
import { accountRecoveryService } from "../account-recovery-service.js";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../../test/helpers/service-test-helper.js";
import { API_ENDPOINTS, PATH_NAMES } from "../../../../app.constants.js";
import {
  createMockRequest,
  createMockResponse,
} from "../../../../../test/helpers/mock-request-helper.js";
import { commonVariables } from "../../../../../test/helpers/common-test-variables.js";
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
    const { email } = commonVariables;
    const req = createMockRequest(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE, {
      headers: requestHeadersWithIpAndAuditEncoded,
    });
    const res = createMockResponse();
    const axiosResponse = Promise.resolve({
      data: {},
      status: 200,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);

    const result = await service.accountRecovery(email, req, res);

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
