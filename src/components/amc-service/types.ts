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

export interface AMCResultInterface<T> {
  getAMCResult: (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    code: string,
    state: string,
    usedRedirectUrl: string,
    language: string
  ) => Promise<AMCServiceResult<T>>;
}

export type AMCServiceResult<T> =
  | { success: true; data: T }
  | { success: false; data: DefaultApiResponse };
