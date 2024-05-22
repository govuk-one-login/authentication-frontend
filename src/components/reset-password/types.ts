import { ApiResponseResult, DefaultApiResponse } from "../../types";
import { Request } from "express";

export interface ResetPasswordServiceInterface {
  updatePassword: (
    newPassword: string,
    sourceIp: string,
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    isForcedPasswordReset: boolean,
    req: Request
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
