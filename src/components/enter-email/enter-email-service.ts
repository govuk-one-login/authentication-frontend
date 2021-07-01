import { getBaseRequestConfig, Http, http } from "../../utils/http";
import { API_ENDPOINTS, NOTIFICATION_TYPE } from "../../app.constants";
import { EnterEmailServiceInterface, UserExists } from "./types";

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
      getBaseRequestConfig(sessionId)
    );

    return data.doesUserExist;
  };

  const sendEmailVerificationNotification = async function (
    sessionId: string,
    email: string
  ): Promise<void> {
    await axios.client.post<void>(
      API_ENDPOINTS.SEND_NOTIFICATION,
      {
        email: email,
        notificationType: NOTIFICATION_TYPE.VERIFY_EMAIL,
      },
      getBaseRequestConfig(sessionId)
    );
  };

  return {
    userExists,
    sendEmailVerificationNotification,
  };
}
