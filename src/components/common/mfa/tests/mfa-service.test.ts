import { describe } from "mocha";
import type { SinonStub } from "sinon";
import sinon from "sinon";
import { Http } from "../../../../utils/http.js";
import type { MfaServiceInterface } from "../types.js";
import { mfaService } from "../mfa-service.js";
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
  PATH_NAMES,
} from "../../../../app.constants.js";
import {
  createMockRequest,
  createMockResponse,
} from "../../../../../test/helpers/mock-request-helper.js";
import { commonVariables } from "../../../../../test/helpers/common-test-variables.js";
describe("mfa service", () => {
  const httpInstance = new Http();
  const service: MfaServiceInterface = mfaService(httpInstance);
  let postStub: SinonStub;

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the API to make a request to send an mfa code", async () => {
    const { email } = commonVariables;
    const req = createMockRequest(PATH_NAMES.ENTER_MFA, {
      headers: requestHeadersWithIpAndAuditEncoded,
    });
    const res = createMockResponse();
    const axiosResponse = Promise.resolve({
      data: {},
      status: HTTP_STATUS_CODES.NO_CONTENT,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
    const userLanguage = "cy";
    const journeyType = JOURNEY_TYPE.SIGN_IN;
    const isResendCodeRequest = true;
    const mfaMethodId = "9b1deb4d-3b7d-4bad-9bdd-2b0d7a3a03d7";

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.MFA,
      expectedHeaders: {
        ...expectedHeadersFromCommonVarsWithSecurityHeaders,
        "User-Language": userLanguage,
      },
      expectedBody: { email, isResendCodeRequest, journeyType, mfaMethodId },
    };

    const result = await service.sendMfaCode(
      email,
      isResendCodeRequest,
      userLanguage,
      req,
      res,
      mfaMethodId,
      journeyType
    );

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });
});
