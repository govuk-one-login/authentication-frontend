import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request, Response } from "express";

export interface CheckReauthServiceInterface {
  checkReauthUsers: (
    email: string,
    sub: string,
    req: Request,
    res: Response
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
