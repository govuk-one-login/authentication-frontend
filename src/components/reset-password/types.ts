import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request } from "express";

export interface ResetPasswordServiceInterface {
  updatePassword: (
    newPassword: string,
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    isForcedPasswordReset: boolean,
    req: Request
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
