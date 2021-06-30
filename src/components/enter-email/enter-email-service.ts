import { Http, http } from "../../utils/http";
import { API_ENDPOINTS, NOTIFICATION_TYPE } from "../../app.constants";
import { EnterEmailServiceInterface, UserExists } from "./types";

export function enterEmailService(
  axios: Http = http
): EnterEmailServiceInterface {
  const userExists = async function (
    sessionId: string,
    emailAddress: string
  ): Promise<boolean> {
    const config = {
      headers: {
        "Session-Id": sessionId,
      },
    };
    const { data } = await axios.client.post<UserExists>(
      API_ENDPOINTS.USER_EXISTS,
      {
        email: emailAddress,
      },
      config
    );

    return data.doesUserExist;
  };

  const sendEmailVerificationNotification = async function (
    sessionId: string,
    email: string
  ): Promise<void> {
    const config = {
      headers: {
        "Session-Id": sessionId,
      },
    };
    await axios.client.post<void>(
      API_ENDPOINTS.SEND_NOTIFICATION,
      {
        email: email,
        notificationType: NOTIFICATION_TYPE.VERIFY_EMAIL,
      },
      config
    );
  };

  return {
    userExists,
    sendEmailVerificationNotification,
  };
}
