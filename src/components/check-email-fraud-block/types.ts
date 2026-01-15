import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request, Response } from "express";

export interface CheckEmailFraudBlockInterface {
  checkEmailFraudBlock: (
    email: string,
    req: Request,
    res: Response
  ) => Promise<ApiResponseResult<CheckEmailFraudBlockResponse>>;
}

type IsBlockedStatus = "ALLOW" | "DENY" | "PENDING";

export interface CheckEmailFraudBlockResponse extends DefaultApiResponse {
  email: string;
  isBlockedStatus: IsBlockedStatus;
}
