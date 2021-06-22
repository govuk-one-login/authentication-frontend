import { API_ENDPOINTS, NOTIFICATION_TYPE } from "../app.constants";
import { http } from "../utils/http";

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
  await http.client.post<string>(
    API_ENDPOINTS.SEND_NOTIFICATION,
    {
      email: email,
      notificationType: notificationType,
    },
    config
  );
}
