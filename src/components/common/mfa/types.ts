import { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import { JOURNEY_TYPE } from "../../../app.constants.js";
import { Request } from "express";

export interface MfaServiceInterface {
  sendMfaCode: (
    sessionId: string,
    clientSessionId: string,
    emailAddress: string,
    persistentSessionId: string,
    isResendCodeRequest: boolean,
    userLanguage: string,
    req: Request,
    journeyType?: JOURNEY_TYPE
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
