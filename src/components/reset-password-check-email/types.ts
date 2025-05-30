import type {
  ApiResponseResult,
  DefaultApiResponse,
  MfaMethod,
} from "../../types.js";
import type { Request } from "express";

export interface ResetPasswordCheckEmailServiceInterface {
  resetPasswordRequest: (
    email: string,
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    withinForcedPasswordResetJourney: boolean,
    req: Request
  ) => Promise<ApiResponseResult<ResetPasswordRequestResponse>>;
}

export interface ResetPasswordRequestResponse extends DefaultApiResponse {
  mfaMethodType: string;
  mfaMethods: MfaMethod[];
  phoneNumberLastThree: string;
}
