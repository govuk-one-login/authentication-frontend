import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import { Http } from "../../../../utils/http";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../../test/helpers/service-test-helper";
import {
  API_ENDPOINTS,
  NOTIFICATION_TYPE,
  PATH_NAMES,
} from "../../../../app.constants";
import { SendNotificationServiceInterface } from "../types";
import { sendNotificationService } from "../send-notification-service";
import { JOURNEY_TYPE } from "../../constants";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper";
import { commonVariables } from "../../../../../test/helpers/common-test-variables";

describe("send notification service", () => {
  let postStub: SinonStub;
  let service: SendNotificationServiceInterface;
  const axiosResponse = Promise.resolve({
    data: {},
    status: 200,
    statusText: "OK",
  });
  const { sessionId, clientSessionId, email, diPersistentSessionId } =
    commonVariables;
  const req = createMockRequest(PATH_NAMES.RESEND_MFA_CODE, {
    headers: requestHeadersWithIpAndAuditEncoded,
  });
  const notificationType = NOTIFICATION_TYPE.VERIFY_EMAIL;
  const userLanguage = "cy";
  const expectedHeaders = {
    ...expectedHeadersFromCommonVarsWithSecurityHeaders,
    "User-Language": userLanguage,
  };

  beforeEach(() => {
    const httpInstance = new Http();
    service = sendNotificationService(httpInstance);
    postStub = sinon.stub(httpInstance.client, "post");
    setupApiKeyAndBaseUrlEnvVars();
    postStub.resolves(axiosResponse);
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the API to send a notification", async () => {
    const result = await service.sendNotification(
      sessionId,
      clientSessionId,
      email,
      notificationType,
      diPersistentSessionId,
      userLanguage,
      req
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.SEND_NOTIFICATION,
      expectedHeaders,
      expectedBody: { email, notificationType },
      validateStatus: true,
    };

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });

  it("adds the additional details to the payload when these are included", async () => {
    const journeyType = JOURNEY_TYPE.CREATE_ACCOUNT;
    const phoneNumber = "123456";
    const requestNewCode = true;
    const result = await service.sendNotification(
      sessionId,
      clientSessionId,
      email,
      notificationType,
      diPersistentSessionId,
      userLanguage,
      req,
      journeyType,
      phoneNumber,
      requestNewCode
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.SEND_NOTIFICATION,
      expectedHeaders,
      expectedBody: {
        email,
        notificationType,
        journeyType,
        phoneNumber,
        requestNewCode,
      },
      validateStatus: true,
    };

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });
});
