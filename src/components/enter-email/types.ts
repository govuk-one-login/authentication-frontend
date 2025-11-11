import type { MFA_METHOD_TYPE } from "src/app.constants.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request, Response } from "express";

export interface UserExists extends DefaultApiResponse {
  email: string;
  doesUserExist: boolean;
  mfaMethodType: MFA_METHOD_TYPE;
  phoneNumberLastThree?: string;
  lockoutInformation?: LockoutInformation[];
}
export interface LockoutInformation {
  lockType: string;
  mfaMethodType: MFA_METHOD_TYPE;
  lockTTL: string;
  journeyType: string;
}

export interface EnterEmailServiceInterface {
  userExists: (
    emailAddress: string,
    req: Request,
    res: Response
  ) => Promise<ApiResponseResult<UserExists>>;
}
