import { ApiResponseResult, DefaultApiResponse } from "../../types";
import { Request } from "express";

export interface ResetPasswordServiceInterface {
  updatePassword: (
    newPassword: string,
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    isForcedPasswordReset: boolean,
    allowMfaResetAfterPasswordReset: boolean,
    req: Request
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
