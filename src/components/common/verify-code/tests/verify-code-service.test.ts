import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import { Http } from "../../../../utils/http";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  commonVariables,
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../../test/helpers/service-test-helper";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  JOURNEY_TYPE,
  NOTIFICATION_TYPE,
  PATH_NAMES,
} from "../../../../app.constants";
import { VerifyCodeInterface } from "../types";
import { codeService } from "../verify-code-service";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper";

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
    const { sessionId, clientSessionId, diPersistentSessionId } =
      commonVariables;
    const req = createMockRequest(PATH_NAMES.ENTER_MFA, {
      headers: requestHeadersWithIpAndAuditEncoded,
    });
    const code = "1234";
    const notificationType = NOTIFICATION_TYPE.VERIFY_EMAIL;
    const journeyType = JOURNEY_TYPE.SIGN_IN;

    const result = await service.verifyCode(
      sessionId,
      code,
      notificationType,
      clientSessionId,
      diPersistentSessionId,
      req,
      journeyType
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.VERIFY_CODE,
      expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
      expectedBody: { code, notificationType, journeyType },
    };

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });
});
