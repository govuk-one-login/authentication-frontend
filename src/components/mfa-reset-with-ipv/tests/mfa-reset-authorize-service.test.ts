import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import { MfaResetAuthorizeInterface } from "../types";
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
import { mfaResetAuthorizeService } from "../mfa-reset-authorize-service";

describe("mfa reset authorize service", () => {
  const http = new Http();
  const service: MfaResetAuthorizeInterface = mfaResetAuthorizeService(http);
  let postStub: SinonStub;
  const { sessionId, clientSessionId, email, diPersistentSessionId } =
    commonVariables;
  const orchestrationRedirectUrl = "http://localhost?state=state";
  const req = createMockRequest(PATH_NAMES.ENTER_MFA, {
    headers: requestHeadersWithIpAndAuditEncoded,
  });
  const axiosResponse = Promise.resolve({
    data: {},
    status: 200,
    statusText: "OK",
  });

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(http.client, "post");
    postStub.resolves(axiosResponse);
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the mfa reset authorize API", async () => {
    const result = await service.ipvRedirectUrl(
      sessionId,
      clientSessionId,
      diPersistentSessionId,
      req,
      email,
      orchestrationRedirectUrl
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.MFA_RESET_AUTHORIZE,
      expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
      expectedBody: { email, orchestrationRedirectUrl },
    };

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });
});
