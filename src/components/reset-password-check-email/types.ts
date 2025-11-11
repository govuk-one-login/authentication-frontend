import type { MFA_METHOD_TYPE } from "src/app.constants.js";
import type {
  ApiResponseResult,
  DefaultApiResponse,
  MfaMethod,
} from "../../types.js";
import type { Request, Response } from "express";

export interface ResetPasswordCheckEmailServiceInterface {
  resetPasswordRequest: (
    email: string,
    withinForcedPasswordResetJourney: boolean,
    req: Request,
    res: Response
  ) => Promise<ApiResponseResult<ResetPasswordRequestResponse>>;
}

export interface ResetPasswordRequestResponse extends DefaultApiResponse {
  mfaMethodType: MFA_METHOD_TYPE;
  mfaMethods: MfaMethod[];
  phoneNumberLastThree: string;
}
