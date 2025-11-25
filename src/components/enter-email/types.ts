import type { MFA_METHOD_TYPE } from "src/app.constants.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request } from "express";

export interface UserExists extends DefaultApiResponse {
  email: string;
  doesUserExist: boolean;
  mfaMethodType: MFA_METHOD_TYPE;
  phoneNumberLastThree?: string;
  lockoutInformation?: LockoutInformation[];
  hasActivePasskey: boolean;
}
export interface LockoutInformation {
  lockType: string;
  mfaMethodType: MFA_METHOD_TYPE;
  lockTTL: string;
  journeyType: string;
}

export interface EnterEmailServiceInterface {
  userExists: (
    sessionId: string,
    emailAddress: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ) => Promise<ApiResponseResult<UserExists>>;
}
