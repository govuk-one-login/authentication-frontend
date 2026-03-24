import type { Request } from "express";
import type { ApiResponseResult } from "../../types.js";

export interface AMCResultInterface {
  getAMCResult: (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    code: string,
    state: string,
    usedRedirectUrl: string,
    language: string
  ) => Promise<ApiResponseResult<string>>;
}
