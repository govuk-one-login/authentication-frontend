import { ApiResponseResult, DefaultApiResponse } from "../../types";

export interface AccountInterventionsInterface {
  accountInterventionStatus: (
    sessionId: string,
    emailAddress: string,
    sourceIp: string,
    clientSessionId: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<AccountInterventionStatus>>;
}

export interface AccountInterventionStatus extends DefaultApiResponse {
  email: string;
  passwordResetRequired: boolean;
  blocked: boolean;
  temporarilySuspended: boolean;
}
