import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request, Response } from "express";

export interface ResetPasswordServiceInterface {
  updatePassword: (
    newPassword: string,
    isForcedPasswordReset: boolean,
    req: Request,
    res: Response
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
