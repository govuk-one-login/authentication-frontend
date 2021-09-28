import { ApiResponseResult } from "../../types";

export interface UserExists {
  email: string;
  doesUserExist: boolean;
  state: string;
}

export interface EnterEmailServiceInterface {
  sendEmailVerificationNotification: (
    sessionId: string,
    email: string,
    sourceIp: string
  ) => Promise<ApiResponseResult>;
  userExists: (sessionId: string, emailAddress: string, sourceIp: string) => Promise<boolean>;
}
