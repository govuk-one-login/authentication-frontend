import { ApiResponse, ApiResponseResult } from "../../../types";
import { API_ENDPOINTS } from "../../../app.constants";
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
    email: string,
    notificationType: string,
    sourceIp: string,
    phoneNumber?: string
  ): Promise<ApiResponseResult> {
    const payload: any = {
      email,
      notificationType,
    };

    if (phoneNumber) {
      payload.phoneNumber = phoneNumber;
    }

    const response = await axios.client.post<ApiResponse>(
      API_ENDPOINTS.SEND_NOTIFICATION,
      payload,
      getRequestConfig({
        sessionId: sessionId,
        sourceIp: sourceIp,
      })
    );

    return createApiResponse(response);
  };

  return {
    sendNotification,
  };
}
