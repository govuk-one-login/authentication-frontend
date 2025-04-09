import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import { ResetPasswordServiceInterface } from "../types.js";
import { resetPasswordService } from "../reset-password-service.js";
import { Http } from "../../../utils/http.js";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper.js";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
describe("reset password service", () => {
  const httpInstance = new Http();
  const service: ResetPasswordServiceInterface =
    resetPasswordService(httpInstance);
  let postStub: SinonStub;

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the API to update a password", async () => {
    const axiosResponse = Promise.resolve({
      data: {},
      status: HTTP_STATUS_CODES.NO_CONTENT,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
    const { sessionId, clientSessionId, diPersistentSessionId } =
      commonVariables;
    const newPassword = "abcdef";
    const isForcedPasswordReset = false;
    const allowMfaResetAfterPasswordReset = true;
    const req = createMockRequest(PATH_NAMES.RESET_PASSWORD, {
      headers: requestHeadersWithIpAndAuditEncoded,
    });

    const result = await service.updatePassword(
      newPassword,
      sessionId,
      clientSessionId,
      diPersistentSessionId,
      isForcedPasswordReset,
      allowMfaResetAfterPasswordReset,
      req
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.RESET_PASSWORD,
      expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
      expectedBody: {
        password: newPassword,
        isForcedPasswordReset: isForcedPasswordReset,
        allowMfaResetAfterPasswordReset: allowMfaResetAfterPasswordReset,
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
