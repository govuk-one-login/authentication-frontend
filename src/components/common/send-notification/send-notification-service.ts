import { ApiResponseResult, DefaultApiResponse } from "../../../types";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants";
import {
  createApiResponse,
  getRequestConfig,
  http,
  Http,
} from "../../../utils/http";
import { SendNotificationServiceInterface } from "./types";

export function sendNotificationService(
  axios: Http = http
): SendNotificationServiceInterface {
  const sendNotification = async function (
    sessionId: string,
    clientSessionId: string,
    email: string,
    notificationType: string,
    sourceIp: string,
    persistentSessionId: string,
    userLanguage: string,
    phoneNumber?: string
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const payload: any = {
      email,
      notificationType,
    };

    if (phoneNumber) {
      payload.phoneNumber = phoneNumber;
    }

    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.SEND_NOTIFICATION,
      payload,
      getRequestConfig({
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        sourceIp: sourceIp,
        persistentSessionId: persistentSessionId,
        validationStatues: [
          HTTP_STATUS_CODES.NO_CONTENT,
          HTTP_STATUS_CODES.BAD_REQUEST,
        ],
        userLanguage: userLanguage,
      })
    );

    return createApiResponse<DefaultApiResponse>(response, [
      HTTP_STATUS_CODES.OK,
      HTTP_STATUS_CODES.NO_CONTENT,
    ]);
  };

  return {
    sendNotification,
  };
}
