import { describe } from "mocha";
import type { SinonStub } from "sinon";
import sinon from "sinon";
import { Http } from "../../../utils/http.js";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper.js";
import { API_ENDPOINTS, HTTP_STATUS_CODES, PATH_NAMES } from "../../../app.constants.js";
import type { ResetPasswordCheckEmailServiceInterface } from "../types.js";
import { resetPasswordCheckEmailService } from "../reset-password-check-email-service.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
describe("reset password check email service", () => {
  const httpInstance = new Http();
  const service: ResetPasswordCheckEmailServiceInterface =
    resetPasswordCheckEmailService(httpInstance);
  let postStub: SinonStub;

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the API to make a request to reset a password", async () => {
    const axiosResponse = Promise.resolve({
      data: {},
      status: HTTP_STATUS_CODES.NO_CONTENT,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
    const { email, sessionId, clientSessionId, diPersistentSessionId } = commonVariables;
    const req = createMockRequest(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL, {
      headers: requestHeadersWithIpAndAuditEncoded,
    });
    const withinForcedPasswordResetJourney = false;

    const result = await service.resetPasswordRequest(
      email,
      sessionId,
      clientSessionId,
      diPersistentSessionId,
      withinForcedPasswordResetJourney,
      req
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.RESET_PASSWORD_REQUEST,
      expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
      expectedBody: { withinForcedPasswordResetJourney, email },
    };

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });
});
