import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import { Http } from "../../../../utils/http";
import { MfaServiceInterface } from "../types";
import { mfaService } from "../mfa-service";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  commonVariables,
  expectedHeadersFromCommonVarsWithoutSecurityHeaders,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../../test/helpers/service-test-helper";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  JOURNEY_TYPE,
} from "../../../../app.constants";

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
    const axiosResponse = Promise.resolve({
      data: {},
      status: HTTP_STATUS_CODES.NO_CONTENT,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
    const { email, sessionId, clientSessionId, ip, diPersistentSessionId } =
      commonVariables;
    const userLanguage = "cy";
    const journeyType = JOURNEY_TYPE.SIGN_IN;
    const isResendCodeRequest = true;

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.MFA,
      expectedHeaders: {
        ...expectedHeadersFromCommonVarsWithoutSecurityHeaders,
        "User-Language": userLanguage,
      },
      expectedBody: { email, isResendCodeRequest, journeyType },
    };

    const result = await service.sendMfaCode(
      sessionId,
      clientSessionId,
      email,
      ip,
      diPersistentSessionId,
      isResendCodeRequest,
      userLanguage,
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
