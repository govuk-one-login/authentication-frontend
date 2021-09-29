import { ApiResponseResult } from "../../types";

export interface UserExists extends ApiResponseResult {
  email: string;
}

export interface EnterEmailServiceInterface {
  userExists: (
    sessionId: string,
    emailAddress: string,
    sourceIp: string
  ) => Promise<ApiResponseResult>;
}
