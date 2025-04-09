import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request } from "express";

export interface ReverificationResultSuccessResponse
  extends DefaultApiResponse {
  sub: string;
  success: true;
}

export interface ReverificationResultFailedResponse extends DefaultApiResponse {
  sub: string;
  success: false;
  failure_code: REVERIFICATION_ERROR_CODE;
  failure_description: string;
}

export enum REVERIFICATION_ERROR_CODE {
  NO_IDENTITY_AVAILABLE = "no_identity_available",
  IDENTITY_CHECK_INCOMPLETE = "identity_check_incomplete",
  IDENTITY_CHECK_FAILED = "identity_check_failed",
  IDENTITY_DID_NOT_MATCH = "identity_did_not_match",
}

export type ReverificationResultResponse =
  | ReverificationResultFailedResponse
  | ReverificationResultSuccessResponse;

export function isReverificationResultFailedResponse(
  response: ReverificationResultResponse
): response is ReverificationResultFailedResponse {
  const responseAsFailed = response as ReverificationResultFailedResponse;
  return responseAsFailed.success !== undefined && !responseAsFailed.success;
}

export interface ReverificationResultInterface {
  getReverificationResult: (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    email: string,
    code: string,
    state: string
  ) => Promise<ApiResponseResult<ReverificationResultResponse>>;
}

export interface CrossBrowserInterface {
  isCrossBrowserIssue: (req: Request) => req is CrossBrowserRequest;
  getOrchestrationRedirectUrl: (req: CrossBrowserRequest) => Promise<string>;
}

export type CrossBrowserRequest = Omit<Request, "query"> & {
  query: { error: "access_denied"; state: string };
};

export interface IDReverificationStateResponse extends DefaultApiResponse {
  orchestrationRedirectUrl: string;
}
