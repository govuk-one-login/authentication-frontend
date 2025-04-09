import { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import { Request } from "express";

export interface CheckReauthServiceInterface {
  checkReauthUsers: (
    sessionId: string,
    email: string,
    sub: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
