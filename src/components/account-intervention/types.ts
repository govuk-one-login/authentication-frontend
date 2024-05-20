import { ApiResponseResult, DefaultApiResponse } from "../../types";
import { Request } from "express";

export interface AccountInterventionsInterface {
  accountInterventionStatus: (
    sessionId: string,
    emailAddress: string,
    sourceIp: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ) => Promise<ApiResponseResult<AccountInterventionStatus>>;
}

export interface AccountInterventionStatus extends DefaultApiResponse {
  passwordResetRequired: boolean;
  blocked: boolean;
  temporarilySuspended: boolean;
  appliedAt: string;
  reproveIdentity: boolean;
}
