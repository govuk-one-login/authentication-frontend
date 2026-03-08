import type { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import type { JOURNEY_TYPE } from "../../../app.constants.js";
import type { Request, Response } from "express";

export interface VerifyCodeInterface {
  verifyCode: (
    code: string,
    notificationType: string,
    req: Request,
    res: Response,
    mfaMethodId: string,
    journeyType: JOURNEY_TYPE
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
