import { NOTIFICATION_TYPE } from "../app.constants";

export interface NotificationServiceInterface {
  sendNotification: (
    sessionId: string,
    email: string,
    notificationType: NOTIFICATION_TYPE
  ) => Promise<void>;

  verifyCode: (
    sessionId: string,
    code: string,
    notificationType: NOTIFICATION_TYPE
  ) => Promise<boolean>;
}
