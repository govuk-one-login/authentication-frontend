import { describe } from "mocha";
import { Http } from "../../../utils/http";
import { sinon } from "../../../../test/utils/test-utils";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants";
import { SinonStub } from "sinon";
import { checkReauthUsersService } from "../check-reauth-users-service";
import { CheckReauthServiceInterface } from "../types";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  commonVariables,
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";

describe("re-authentication service", () => {
  const httpInstance = new Http();
  const service: CheckReauthServiceInterface =
    checkReauthUsersService(httpInstance);
  const SUBJECT = "123";
  let postStub: SinonStub;

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the API to check a reauth user", async () => {
    const axiosResponse = Promise.resolve({
      data: {},
      status: 200,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
    const { sessionId, email, ip, clientSessionId, diPersistentSessionId } =
      commonVariables;
    const req = createMockRequest(PATH_NAMES.ENTER_EMAIL_SIGN_IN, {
      headers: requestHeadersWithIpAndAuditEncoded,
    });

    const result = await service.checkReauthUsers(
      sessionId,
      email,
      SUBJECT,
      ip,
      clientSessionId,
      diPersistentSessionId,
      req
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.CHECK_REAUTH_USER,
      expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
      expectedBody: { email: commonVariables.email, rpPairwiseId: SUBJECT },
      validateStatus: true,
    };

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });
});
