import type { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import type { Request, Response } from "express";

export interface AccountRecoveryResponse extends DefaultApiResponse {
  accountRecoveryPermitted: boolean;
}

export interface AccountRecoveryInterface {
  accountRecovery: (
    email: string,
    req: Request,
    res: Response
  ) => Promise<ApiResponseResult<AccountRecoveryResponse>>;
}
