import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request } from "express";

export interface SfadAuthorizeResponse extends DefaultApiResponse {
  redirectUrl: string;
}

export interface SfadAuthorizeInterface {
  getRedirectUrl: (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ) => Promise<ApiResponseResult<SfadAuthorizeResponse>>;
}
