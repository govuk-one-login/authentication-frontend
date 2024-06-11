import { ApiResponseResult, DefaultApiResponse } from "../../../types";
import { Request } from "express";

export interface SendNotificationServiceInterface {
  sendNotification: (
    sessionId: string,
    clientSessionId: string,
    email: string,
    notificationType: string,
    persistentSessionId: string,
    userLanguage: string,
    req: Request,
    journeyType?: string,
    phoneNumber?: string,
    requestNewCode?: boolean
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
