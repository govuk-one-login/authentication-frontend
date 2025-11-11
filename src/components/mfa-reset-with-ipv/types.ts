import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request, Response } from "express";

export interface MfaResetAuthorizeResponse extends DefaultApiResponse {
  authorize_url: string;
}

export interface MfaResetAuthorizeInterface {
  ipvRedirectUrl: (
    req: Request,
    res: Response,
    email: string,
    orchestrationRedirectUrl: string
  ) => Promise<ApiResponseResult<MfaResetAuthorizeResponse>>;
}
