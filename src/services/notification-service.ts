import { API_ENDPOINTS, NOTIFICATION_TYPE, USER_STATE } from "../app.constants";
import { http } from "../utils/http";
import { VerifyCode } from "./types/verify-code";

export async function sendNotification(
  sessionId: string,
  email: string,
  notificationType: NOTIFICATION_TYPE
): Promise<void> {
  const config = {
    headers: {
      "Session-Id": sessionId,
    },
  };
  await http.client.post<void>(
    API_ENDPOINTS.SEND_NOTIFICATION,
    {
      email: email,
      notificationType: notificationType,
    },
    config
  );
}

export async function verifyCode(
  sessionId: string,
  code: string,
  notificationType: NOTIFICATION_TYPE
): Promise<boolean> {
  const config = {
    headers: {
      "Session-Id": sessionId,
    },
  };
  const { data } = await http.client.post<VerifyCode>(
    API_ENDPOINTS.VERIFY_CODE,
    {
      code: code,
      notificationType: notificationType,
    },
    config
  );

  return (
    data.sessionState && data.sessionState === USER_STATE.EMAIL_CODE_VERIFIED
  );
}
