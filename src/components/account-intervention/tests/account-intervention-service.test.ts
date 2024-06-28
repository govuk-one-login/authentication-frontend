import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import { AccountInterventionsInterface } from "../types";
import { accountInterventionService } from "../account-intervention-service";
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

describe("account interventions service", () => {
  const httpInstance = new Http();
  const service: AccountInterventionsInterface =
    accountInterventionService(httpInstance);
  let postStub: SinonStub;
  const { sessionId, clientSessionId, email, diPersistentSessionId } =
    commonVariables;
  const req = createMockRequest(PATH_NAMES.AUTH_CODE, {
    headers: requestHeadersWithIpAndAuditEncoded,
  });
  const axiosResponse = Promise.resolve({
    data: {},
    status: 200,
    statusText: "OK",
  });

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(httpInstance.client, "post");
    postStub.resolves(axiosResponse);
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the API to check a user's account interventions status", async () => {
    const result = await service.accountInterventionStatus(
      sessionId,
      email,
      clientSessionId,
      diPersistentSessionId,
      req
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.ACCOUNT_INTERVENTIONS,
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

  const BOOLEANS = [true, false];
  BOOLEANS.forEach((isAuthenticated) => {
    it(`calls the api with the authenticated flag when this is passed through as ${isAuthenticated}`, async () => {
      const result = await service.accountInterventionStatus(
        sessionId,
        email,
        clientSessionId,
        diPersistentSessionId,
        req,
        isAuthenticated
      );

      const expectedApiCallDetails = {
        expectedPath: API_ENDPOINTS.ACCOUNT_INTERVENTIONS,
        expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
        expectedBody: {
          email: commonVariables.email,
          authenticated: isAuthenticated,
        },
      };

      checkApiCallMadeWithExpectedBodyAndHeaders(
        result,
        postStub,
        true,
        expectedApiCallDetails
      );
    });
  });
});
