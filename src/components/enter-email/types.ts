import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request } from "express";

export interface UserExists extends DefaultApiResponse {
  email: string;
  doesUserExist: boolean;
  mfaMethodType: string;
  phoneNumberLastThree?: string;
  lockoutInformation?: LockoutInformation[];
}
export interface LockoutInformation {
  lockType: string;
  mfaMethodType: string;
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
