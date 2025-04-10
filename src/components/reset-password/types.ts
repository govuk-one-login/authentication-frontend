import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request } from "express";

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
