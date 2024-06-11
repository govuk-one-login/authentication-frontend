import { ApiResponseResult, DefaultApiResponse } from "../../../types";
import { Request } from "express";

export interface AccountRecoveryResponse extends DefaultApiResponse {
  accountRecoveryPermitted: boolean;
}

export interface AccountRecoveryInterface {
  accountRecovery: (
    sessionId: string,
    clientSessionId: string,
    email: string,
    persistentSessionId: string,
    req: Request
  ) => Promise<ApiResponseResult<AccountRecoveryResponse>>;
}
