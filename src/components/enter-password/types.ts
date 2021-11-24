import { ApiResponseResult } from "../../types";

export interface UserLoginResponse extends ApiResponseResult {
  redactedPhoneNumber?: string;
}

export interface EnterPasswordServiceInterface {
  loginUser: (
    sessionId: string,
    email: string,
    password: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<UserLoginResponse>;
}
