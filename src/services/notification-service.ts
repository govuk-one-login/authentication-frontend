import { API_ENDPOINTS, NOTIFICATION_TYPE } from "../app.constants";
import { http } from "../utils/http";

export async function sendNotification(
  sessionId: string,
  emailAddress: string,
  notificationType: NOTIFICATION_TYPE
): Promise<void> {
  http.sessionId = sessionId;

  await http.client.post<void>(API_ENDPOINTS.SEND_NOTIFICATION, {
    email: emailAddress,
    notificationType: notificationType,
  });
}
