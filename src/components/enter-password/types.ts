import { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import { JOURNEY_TYPE } from "../../app.constants.js";
import { Request } from "express";

export interface UserLoginResponse extends DefaultApiResponse {
  redactedPhoneNumber?: string;
  mfaRequired?: boolean;
  latestTermsAndConditionsAccepted?: boolean;
  mfaMethodType?: string;
  mfaMethodVerified?: boolean;
  passwordChangeRequired?: boolean;
}

export interface EnterPasswordServiceInterface {
  loginUser: (
    sessionId: string,
    email: string,
    password: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    journeyType?: JOURNEY_TYPE
  ) => Promise<ApiResponseResult<UserLoginResponse>>;
}
