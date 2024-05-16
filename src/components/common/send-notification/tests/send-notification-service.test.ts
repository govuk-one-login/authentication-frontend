import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import { Http } from "../../../../utils/http";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  commonVariables,
  expectedHeadersFromCommonVarsWithoutSecurityHeaders,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../../test/helpers/service-test-helper";
import { API_ENDPOINTS, NOTIFICATION_TYPE } from "../../../../app.constants";
import { SendNotificationServiceInterface } from "../types";
import { sendNotificationService } from "../send-notification-service";
import { JOURNEY_TYPE } from "../../constants";

describe("send notification service", () => {
  let postStub: SinonStub;
  let service: SendNotificationServiceInterface;
  const axiosResponse = Promise.resolve({
    data: {},
    status: 200,
    statusText: "OK",
  });
  const { sessionId, clientSessionId, email, ip, diPersistentSessionId } =
    commonVariables;
  const notificationType = NOTIFICATION_TYPE.VERIFY_EMAIL;
  const userLanguage = "cy";
  const expectedHeaders = {
    ...expectedHeadersFromCommonVarsWithoutSecurityHeaders,
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
      ip,
      diPersistentSessionId,
      userLanguage
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
      ip,
      diPersistentSessionId,
      userLanguage,
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
