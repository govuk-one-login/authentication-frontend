import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import { Http } from "../../../../utils/http.js";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../../test/helpers/service-test-helper.js";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  JOURNEY_TYPE,
  MFA_METHOD_TYPE,
  PATH_NAMES,
} from "../../../../app.constants.js";
import { VerifyMfaCodeInterface } from "../../../enter-authenticator-app-code/types.js";
import { verifyMfaCodeService } from "../verify-mfa-code-service.js";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper.js";
import { commonVariables } from "../../../../../test/helpers/common-test-variables.js";
describe("verify mfa code service", () => {
  const httpInstance = new Http();
  const service: VerifyMfaCodeInterface = verifyMfaCodeService(httpInstance);
  let postStub: SinonStub;

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the API to verify an mfa code", async () => {
    const { sessionId, clientSessionId, diPersistentSessionId } =
      commonVariables;
    const req = createMockRequest(PATH_NAMES.ENTER_MFA, {
      headers: requestHeadersWithIpAndAuditEncoded,
    });
    const axiosResponse = Promise.resolve({
      data: {},
      status: HTTP_STATUS_CODES.NO_CONTENT,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
    const code = "1234";
    const journeyType = JOURNEY_TYPE.SIGN_IN;
    const mfaMethodType = MFA_METHOD_TYPE.SMS;
    const profileInformation = "some profile information"; //TODO check for realistic value

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.VERIFY_MFA_CODE,
      expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
      expectedBody: { mfaMethodType, code, journeyType, profileInformation },
    };

    const result = await service.verifyMfaCode(
      mfaMethodType,
      code,
      sessionId,
      clientSessionId,
      diPersistentSessionId,
      req,
      journeyType,
      profileInformation
    );

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });
});
