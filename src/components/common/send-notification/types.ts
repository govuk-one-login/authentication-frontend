import type { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import type { Request, Response } from "express";

export interface SendNotificationServiceInterface {
  sendNotification: (
    email: string,
    notificationType: string,
    userLanguage: string,
    req: Request,
    res: Response,
    journeyType?: string,
    phoneNumber?: string,
    requestNewCode?: boolean
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
