import { ApiResponseResult, DefaultApiResponse } from "../../../types";

export interface SendNotificationServiceInterface {
  sendNotification: (
    sessionId: string,
    clientSessionId: string,
    email: string,
    notificationType: string,
    sourceIp: string,
    persistentSessionId: string,
    userLanguage: string,
    phoneNumber?: string
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
