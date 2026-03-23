import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request } from "express";

export interface AmcAuthorizeResponse extends DefaultApiResponse {
  redirectUrl: string;
}

export interface AmcAuthorizeInterface {
  getRedirectUrl: (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    journeyType: string
  ) => Promise<ApiResponseResult<AmcAuthorizeResponse>>;
}
