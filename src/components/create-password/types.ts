import { ApiResponseResult } from "../../types";

export interface CreatePasswordServiceInterface {
  signUpUser: (
    sessionId: string,
    emailAddress: string,
    password: string,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult>;
}
