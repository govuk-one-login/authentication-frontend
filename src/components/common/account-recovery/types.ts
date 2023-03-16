import { ApiResponseResult, DefaultApiResponse } from "../../../types";

export interface AccountRecoveryResponse extends DefaultApiResponse {
  accountRecoveryPermitted: boolean;
}

export interface AccountRecoveryInterface {
  accountRecovery: (
    sessionId: string,
    clientSessionId: string,
    email: string,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<AccountRecoveryResponse>>;
}
