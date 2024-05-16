import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import { ResetPasswordServiceInterface } from "../types";
import { resetPasswordService } from "../reset-password-service";
import { Http } from "../../../utils/http";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  commonVariables,
  expectedHeadersFromCommonVarsWithoutSecurityHeaders,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants";

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
    const { sessionId, clientSessionId, ip, diPersistentSessionId } =
      commonVariables;
    const newPassword = "abcdef";
    const isForcedPasswordReset = false;

    const result = await service.updatePassword(
      newPassword,
      ip,
      sessionId,
      clientSessionId,
      diPersistentSessionId,
      isForcedPasswordReset
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.RESET_PASSWORD,
      expectedHeaders: expectedHeadersFromCommonVarsWithoutSecurityHeaders,
      expectedBody: { password: newPassword },
    };

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });
});
