import { ApiResponseResult, DefaultApiResponse } from "../../types";
import { Request, Response } from "express";
import { JOURNEY_TYPE, MFA_METHOD_TYPE } from "../../app.constants";

export interface VerifyMfaCodeInterface {
  verifyMfaCode: (
    methodType: MFA_METHOD_TYPE,
    code: string,
    isRegistration: boolean,
    sessionId: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string,
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
