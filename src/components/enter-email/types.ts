import { ApiResponseResult, DefaultApiResponse } from "../../types";

export interface UserExists extends DefaultApiResponse {
  email: string;
  doesUserExist: boolean;
  mfaMethodType: string;
  phoneNumberLastThree?: string;
}

export interface EnterEmailServiceInterface {
  userExists: (
    sessionId: string,
    emailAddress: string,
    sourceIp: string,
    clientSessionId: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<UserExists>>;
}
