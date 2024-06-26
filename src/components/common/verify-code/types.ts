import { ApiResponseResult, DefaultApiResponse } from "../../../types";
import { JOURNEY_TYPE } from "../../../app.constants";
import { Request } from "express";

export interface VerifyCodeInterface {
  verifyCode: (
    sessionId: string,
    code: string,
    notificationType: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    journeyType: JOURNEY_TYPE
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
