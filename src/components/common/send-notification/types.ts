import { ApiResponseResult } from "../../../types";

export interface SendNotificationServiceInterface {
  sendNotification: (
    sessionId: string,
    email: string,
    notificationType: string,
    sourceIp: string,
    phoneNumber?: string
  ) => Promise<ApiResponseResult>;
}
