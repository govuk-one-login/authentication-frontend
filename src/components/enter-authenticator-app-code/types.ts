import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request, Response } from "express";
import type { JOURNEY_TYPE, MFA_METHOD_TYPE } from "../../app.constants.js";
export interface VerifyMfaCodeInterface {
  verifyMfaCode: (
    methodType: MFA_METHOD_TYPE,
    code: string,
    req: Request,
    res: Response,
    journeyType: JOURNEY_TYPE,
    profileInformation?: string
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}

export interface VerifyMfaCodeConfig {
  template: string;
  validationKey: string;
  validationErrorCode: number;
  callback?: (req: Request, res: Response) => void;
}
