import { describe } from "mocha";
import type { SinonStub } from "sinon";
import sinon from "sinon";
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
  NOTIFICATION_TYPE,
  PATH_NAMES,
} from "../../../../app.constants.js";
import type { VerifyCodeInterface } from "../types.js";
import { codeService } from "../verify-code-service.js";
import {
  createMockRequest,
  createMockResponse,
} from "../../../../../test/helpers/mock-request-helper.js";
describe("verify code service", () => {
  const httpInstance = new Http();
  const service: VerifyCodeInterface = codeService(httpInstance);
  let postStub: SinonStub;

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the API to verify a code", async () => {
    const axiosResponse = Promise.resolve({
      data: {},
      status: HTTP_STATUS_CODES.NO_CONTENT,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
    const req = createMockRequest(PATH_NAMES.ENTER_MFA, {
      headers: requestHeadersWithIpAndAuditEncoded,
    });
    const res = createMockResponse();
    const code = "1234";
    const notificationType = NOTIFICATION_TYPE.VERIFY_EMAIL;
    const journeyType = JOURNEY_TYPE.SIGN_IN;
    const mfaMethodId = "9b1deb4d-3b7d-4bad-9bdd-2b0d7a3a03d7";

    const result = await service.verifyCode(
      code,
      notificationType,
      req,
      res,
      mfaMethodId,
      journeyType
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.VERIFY_CODE,
      expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
      expectedBody: { code, notificationType, journeyType, mfaMethodId },
    };

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });
});
