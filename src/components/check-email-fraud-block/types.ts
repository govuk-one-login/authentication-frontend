import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request } from "express";

export interface CheckEmailFraudBlockInterface {
  checkEmailFraudBlock: (
    email: string,
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ) => Promise<ApiResponseResult<CheckEmailFraudBlockResponse>>;
}

type IsBlockedStatus = "ALLOW" | "DENY" | "PENDING";

export interface CheckEmailFraudBlockResponse extends DefaultApiResponse {
  email: string;
  isBlockedStatus: IsBlockedStatus;
}
