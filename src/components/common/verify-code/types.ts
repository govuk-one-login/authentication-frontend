import type { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import type { JOURNEY_TYPE } from "../../../app.constants.js";
import type { Request } from "express";

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
