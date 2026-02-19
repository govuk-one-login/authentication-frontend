import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request, Response } from "express";

export interface CreatePasswordServiceInterface {
  signUpUser: (
    emailAddress: string,
    password: string,
    req: Request,
    res: Response
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
