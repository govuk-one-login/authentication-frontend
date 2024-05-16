import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  commonVariables,
  expectedHeadersFromCommonVarsWithoutSecurityHeaders,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper";
import { EnterEmailServiceInterface } from "../types";
import { enterEmailService } from "../enter-email-service";
import { Http } from "../../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants";

describe("enter email service", () => {
  const httpInstance = new Http();
  const service: EnterEmailServiceInterface = enterEmailService(httpInstance);
  let postStub: SinonStub;

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the API to check if a user exists", async () => {
    const axiosResponse = Promise.resolve({
      data: {},
      status: HTTP_STATUS_CODES.OK,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
    const { email, sessionId, clientSessionId, ip, diPersistentSessionId } =
      commonVariables;

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.USER_EXISTS,
      expectedHeaders: expectedHeadersFromCommonVarsWithoutSecurityHeaders,
      expectedBody: { email },
    };

    const result = await service.userExists(
      sessionId,
      email,
      ip,
      clientSessionId,
      diPersistentSessionId
    );

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });
});
