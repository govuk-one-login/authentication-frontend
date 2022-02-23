import { ApiResponseResult, DefaultApiResponse } from "../../types";

export interface CreatePasswordServiceInterface {
  signUpUser: (
    sessionId: string,
    emailAddress: string,
    password: string,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<SignUpResponse>>;
}

export interface SignUpResponse extends DefaultApiResponse {
  consentRequired: boolean;
}
