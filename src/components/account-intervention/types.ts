import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request, Response } from "express";

export interface AccountInterventionsInterface {
  accountInterventionStatus: (
    emailAddress: string,
    req: Request,
    res: Response,
    authenticated?: boolean
  ) => Promise<ApiResponseResult<AccountInterventionStatus>>;
}

export interface AccountInterventionStatus extends DefaultApiResponse {
  passwordResetRequired: boolean;
  blocked: boolean;
  temporarilySuspended: boolean;
  appliedAt: number;
  reproveIdentity: boolean;
}
