import { getRequestConfig, Http, http } from "../../utils/http";
import { API_ENDPOINTS, NOTIFICATION_TYPE } from "../../app.constants";
import { AccountNotFoundServiceInterface } from "./types";

export function accountNotFoundService(
  axios: Http = http
): AccountNotFoundServiceInterface {
  const sendEmailVerificationNotification = async function (
    sessionId: string,
    email: string,
    sourceIp: string
  ): Promise<void> {
    await axios.client.post<void>(
      API_ENDPOINTS.SEND_NOTIFICATION,
      {
        email: email,
        notificationType: NOTIFICATION_TYPE.VERIFY_EMAIL,
      },
      getRequestConfig({ sessionId: sessionId, sourceIp: sourceIp })
    );
  };

  return {
    sendEmailVerificationNotification,
  };
}
