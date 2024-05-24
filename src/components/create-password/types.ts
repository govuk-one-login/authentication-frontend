import { ApiResponseResult, DefaultApiResponse } from "../../types";
import { Request } from "express";

export interface CreatePasswordServiceInterface {
  signUpUser: (
    sessionId: string,
    clientSessionId: string,
    emailAddress: string,
    password: string,
    sourceIp: string,
    persistentSessionId: string,
    req: Request
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
