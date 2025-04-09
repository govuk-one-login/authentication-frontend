import { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import { Request } from "express";

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
