import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import { AccountInterventionsInterface } from "../types";
import { accountInterventionService } from "../account-intervention-service";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  commonVariables,
  expectedHeadersFromCommonVarsWithoutSecurityHeaders,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper";
import { API_ENDPOINTS } from "../../../app.constants";
import { Http } from "../../../utils/http";

describe("account interventions service", () => {
  const httpInstance = new Http();
  const service: AccountInterventionsInterface =
    accountInterventionService(httpInstance);
  let postStub: SinonStub;

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the API to check a user's account interventions status", async () => {
    const axiosResponse = Promise.resolve({
      data: {},
      status: 200,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
    const { sessionId, clientSessionId, email, ip, diPersistentSessionId } =
      commonVariables;

    const result = await service.accountInterventionStatus(
      sessionId,
      email,
      ip,
      clientSessionId,
      diPersistentSessionId
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.ACCOUNT_INTERVENTIONS,
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
