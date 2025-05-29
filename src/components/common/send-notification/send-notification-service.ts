import type { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants.js";
import type { Http } from "../../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../../utils/http.js";
import type { SendNotificationServiceInterface } from "./types.js";
import type { Request } from "express";

export function sendNotificationService(
  axios: Http = http
): SendNotificationServiceInterface {
  const sendNotification = async function (
    sessionId: string,
    clientSessionId: string,
    email: string,
    notificationType: string,
    persistentSessionId: string,
    userLanguage: string,
    req: Request,
    journeyType?: string,
    phoneNumber?: string,
    requestNewCode?: boolean
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const payload: any = { email, notificationType };

    if (phoneNumber) {
      payload.phoneNumber = phoneNumber;
    }

    if (requestNewCode) {
      payload.requestNewCode = requestNewCode;
    }

    if (journeyType) {
      payload.journeyType = journeyType;
    }

    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.SEND_NOTIFICATION,
      payload,
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          clientSessionId: clientSessionId,
          persistentSessionId: persistentSessionId,
          validationStatuses: [
            HTTP_STATUS_CODES.NO_CONTENT,
            HTTP_STATUS_CODES.BAD_REQUEST,
          ],
          userLanguage: userLanguage,
        },
        req,
        API_ENDPOINTS.SEND_NOTIFICATION
      )
    );

    return createApiResponse<DefaultApiResponse>(response, [
      HTTP_STATUS_CODES.OK,
      HTTP_STATUS_CODES.NO_CONTENT,
    ]);
  };

  return { sendNotification };
}
