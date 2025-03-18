import { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import { Request } from "express";

export interface MfaResetAuthorizeResponse extends DefaultApiResponse {
  authorize_url: string;
}

export interface MfaResetAuthorizeInterface {
  ipvRedirectUrl: (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    email: string,
    orchestrationRedirectUrl: string
  ) => Promise<ApiResponseResult<MfaResetAuthorizeResponse>>;
}
