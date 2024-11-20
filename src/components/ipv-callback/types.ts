import { ApiResponseResult, DefaultApiResponse } from "../../types";
import { Request } from "express";

export interface ReverificationResultResponse extends DefaultApiResponse {
  sub: string;
  success: boolean;
}

export interface ReverificationResultInterface {
  getReverificationResult: (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    email: string,
    code: string
  ) => Promise<ApiResponseResult<ReverificationResultResponse>>;
}
