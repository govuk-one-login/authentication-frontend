import { ApiResponseResult, DefaultApiResponse } from "../../types";

export interface UserLoginResponse extends DefaultApiResponse {
  redactedPhoneNumber?: string;
  mfaRequired?: boolean;
  phoneNumberVerified?: boolean;
  latestTermsAndConditionsAccepted?: boolean;
  consentRequired?: boolean;
}

export interface EnterPasswordServiceInterface {
  loginUser: (
    sessionId: string,
    email: string,
    password: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<UserLoginResponse>>;
}
