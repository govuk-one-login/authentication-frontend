import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request } from "express";

export interface DocCheckingAuthorisationResponse extends DefaultApiResponse {
  redirectUri?: string;
}

export interface DocCheckingAppInterface {
  docCheckingAppAuthorize: (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ) => Promise<ApiResponseResult<DocCheckingAuthorisationResponse>>;
}
