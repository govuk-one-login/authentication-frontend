import { ApiResponseResult, DefaultApiResponse } from "../../types";
import { JOURNEY_TYPE } from "../../app.constants";

export interface UserLoginResponse extends DefaultApiResponse {
  redactedPhoneNumber?: string;
  mfaRequired?: boolean;
  latestTermsAndConditionsAccepted?: boolean;
  consentRequired?: boolean;
  mfaMethodType?: string;
  mfaMethodVerified?: boolean;
  passwordChangeRequired?: boolean;
}

export interface EnterPasswordServiceInterface {
  loginUser: (
    sessionId: string,
    email: string,
    password: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string,
    journeyType?: JOURNEY_TYPE
  ) => Promise<ApiResponseResult<UserLoginResponse>>;
}
