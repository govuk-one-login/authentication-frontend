import type {
  ApiResponseResult,
  DefaultApiResponse,
  MfaMethod,
} from "../../types.js";
import type { JOURNEY_TYPE, MFA_METHOD_TYPE } from "../../app.constants.js";
import type { Request, Response } from "express";

export interface UserLoginResponse extends DefaultApiResponse {
  redactedPhoneNumber?: string;
  mfaRequired?: boolean;
  latestTermsAndConditionsAccepted?: boolean;
  mfaMethodType?: MFA_METHOD_TYPE;
  mfaMethodVerified?: boolean;
  mfaMethods: MfaMethod[];
  passwordChangeRequired?: boolean;
}

export interface EnterPasswordServiceInterface {
  loginUser: (
    email: string,
    password: string,
    req: Request,
    res: Response,
    journeyType?: JOURNEY_TYPE
  ) => Promise<ApiResponseResult<UserLoginResponse>>;
}
