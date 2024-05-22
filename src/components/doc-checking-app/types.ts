import { ApiResponseResult, DefaultApiResponse } from "../../types";
import { Request } from "express";

export interface DocCheckingAuthorisationResponse extends DefaultApiResponse {
  redirectUri?: string;
}

export interface DocCheckingAppInterface {
  docCheckingAppAuthorize: (
    sessionId: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string,
    req: Request
  ) => Promise<ApiResponseResult<DocCheckingAuthorisationResponse>>;
}
