import { ApiResponseResult, DefaultApiResponse } from "../../types";
import { Request } from "express";

export interface AccountInterventionsInterface {
  accountInterventionStatus: (
    sessionId: string,
    emailAddress: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    authenticated?: boolean
  ) => Promise<ApiResponseResult<AccountInterventionStatus>>;
}

export interface AccountInterventionStatus extends DefaultApiResponse {
  passwordResetRequired: boolean;
  blocked: boolean;
  temporarilySuspended: boolean;
  appliedAt: string;
  reproveIdentity: boolean;
}
