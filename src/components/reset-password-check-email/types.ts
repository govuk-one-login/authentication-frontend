import { ApiResponseResult, DefaultApiResponse } from "../../types";

export interface ResetPasswordCheckEmailServiceInterface {
  resetPasswordRequest: (
    email: string,
    sessionId: string,
    sourceIp: string,
    clientSessionId: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<ResetPasswordRequestResponse>>;
}

export interface ResetPasswordRequestResponse extends DefaultApiResponse {
  mfaMethodType: string;
  phoneNumberLastThree: string;
}
