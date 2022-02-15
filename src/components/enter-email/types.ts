import { ApiResponseResult, DefaultApiResponse } from "../../types";

export interface UserExists extends DefaultApiResponse {
  email: string;
  doesUserExist: boolean;
}

export interface EnterEmailServiceInterface {
  userExists: (
    sessionId: string,
    emailAddress: string,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<UserExists>>;
}
