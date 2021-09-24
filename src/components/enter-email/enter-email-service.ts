import { getRequestConfig, Http, http } from "../../utils/http";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  NOTIFICATION_TYPE,
} from "../../app.constants";
import { EnterEmailServiceInterface, UserExists } from "./types";
import { ApiResponse, ApiResponseResult } from "../../types";

export function enterEmailService(
  axios: Http = http
): EnterEmailServiceInterface {
  const userExists = async function (
    sessionId: string,
    emailAddress: string
  ): Promise<boolean> {
    const { data } = await axios.client.post<UserExists>(
      API_ENDPOINTS.USER_EXISTS,
      {
        email: emailAddress,
      },
      getRequestConfig({ sessionId: sessionId })
    );

    return data.doesUserExist;
  };

  const sendEmailVerificationNotification = async function (
    sessionId: string,
    email: string
  ): Promise<ApiResponseResult> {
    const { data, status } = await axios.client.post<ApiResponse>(
      API_ENDPOINTS.SEND_NOTIFICATION,
      {
        email: email,
        notificationType: NOTIFICATION_TYPE.VERIFY_EMAIL,
      },
      getRequestConfig({
        sessionId: sessionId,
        validationStatues: [
          HTTP_STATUS_CODES.OK,
          HTTP_STATUS_CODES.BAD_REQUEST,
        ],
      })
    );

    return {
      success: status === HTTP_STATUS_CODES.OK,
      sessionState: data.sessionState,
    };
  };

  return {
    userExists,
    sendEmailVerificationNotification,
  };
}
