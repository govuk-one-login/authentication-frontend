import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  commonVariables,
  expectedHeadersFromCommonVarsWithoutSecurityHeaders,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper";
import { Http } from "../../../utils/http";
import { CreatePasswordServiceInterface } from "../types";
import { createPasswordService } from "../create-password-service";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants";

describe("create password service", () => {
  const httpInstance = new Http();
  const service: CreatePasswordServiceInterface =
    createPasswordService(httpInstance);
  let postStub: SinonStub;

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the API to create a password", async () => {
    const axiosResponse = Promise.resolve({
      data: {},
      status: HTTP_STATUS_CODES.OK,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
    const { email, sessionId, clientSessionId, ip, diPersistentSessionId } =
      commonVariables;
    const password = "abcdef";

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.SIGNUP_USER,
      expectedHeaders: expectedHeadersFromCommonVarsWithoutSecurityHeaders,
      expectedBody: { email, password },
    };

    const result = await service.signUpUser(
      sessionId,
      clientSessionId,
      email,
      password,
      ip,
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
