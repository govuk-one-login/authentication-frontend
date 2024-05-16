import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import { Http } from "../../../utils/http";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  commonVariables,
  expectedHeadersFromCommonVarsWithoutSecurityHeaders,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants";
import { ResetPasswordCheckEmailServiceInterface } from "../types";
import { resetPasswordCheckEmailService } from "../reset-password-check-email-service";

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

  it("successfully calls the API to make a request to reset a password ", async () => {
    const axiosResponse = Promise.resolve({
      data: {},
      status: HTTP_STATUS_CODES.NO_CONTENT,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
    const { email, sessionId, clientSessionId, ip, diPersistentSessionId } =
      commonVariables;
    const withinForcedPasswordResetJourney = false;

    const result = await service.resetPasswordRequest(
      email,
      sessionId,
      ip,
      clientSessionId,
      diPersistentSessionId,
      withinForcedPasswordResetJourney
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.RESET_PASSWORD_REQUEST,
      expectedHeaders: expectedHeadersFromCommonVarsWithoutSecurityHeaders,
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
