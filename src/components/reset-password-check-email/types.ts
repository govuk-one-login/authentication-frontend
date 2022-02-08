import { ApiResponseResult, DefaultApiResponse } from "../../types";

export interface ResetPasswordCheckEmailServiceInterface {
  resetPasswordRequest: (
    email: string,
    sessionId: string,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
