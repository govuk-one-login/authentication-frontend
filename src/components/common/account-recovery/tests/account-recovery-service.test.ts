import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import { Http } from "../../../../utils/http";
import { AccountRecoveryInterface } from "../types";
import { accountRecoveryService } from "../account-recovery-service";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  commonVariables,
  expectedHeadersFromCommonVarsWithoutSecurityHeaders,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../../test/helpers/service-test-helper";
import { API_ENDPOINTS } from "../../../../app.constants";

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
    const axiosResponse = Promise.resolve({
      data: {},
      status: 200,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
    const { sessionId, clientSessionId, email, ip, diPersistentSessionId } =
      commonVariables;

    const result = await service.accountRecovery(
      sessionId,
      clientSessionId,
      email,
      ip,
      diPersistentSessionId
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.ACCOUNT_RECOVERY,
      expectedHeaders: expectedHeadersFromCommonVarsWithoutSecurityHeaders,
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
