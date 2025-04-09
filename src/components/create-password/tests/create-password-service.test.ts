import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper.js";
import { Http } from "../../../utils/http.js";
import { CreatePasswordServiceInterface } from "../types.js";
import { createPasswordService } from "../create-password-service.js";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
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
    const req = createMockRequest(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD, {
      headers: requestHeadersWithIpAndAuditEncoded,
    });
    const { email, sessionId, clientSessionId, diPersistentSessionId } =
      commonVariables;
    const password = "abcdef";

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.SIGNUP_USER,
      expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
      expectedBody: { email, password },
    };

    const result = await service.signUpUser(
      sessionId,
      clientSessionId,
      email,
      password,
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
