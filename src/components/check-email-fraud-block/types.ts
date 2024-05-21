import { ApiResponseResult, DefaultApiResponse } from "../../types";
import { Request } from "express";

export interface CheckEmailFraudBlockInterface {
  checkEmailFraudBlock: (
    email: string,
    sessionId: string,
    sourceIp: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ) => Promise<ApiResponseResult<CheckEmailFraudBlockResponse>>;
}

export interface CheckEmailFraudBlockResponse extends DefaultApiResponse {
  email: string;
  isBlockedStatus: string;
}
