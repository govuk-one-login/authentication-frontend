import { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import { Request } from "express";

export interface CreatePasswordServiceInterface {
  signUpUser: (
    sessionId: string,
    clientSessionId: string,
    emailAddress: string,
    password: string,
    persistentSessionId: string,
    req: Request
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
