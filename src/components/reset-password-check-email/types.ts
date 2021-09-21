import { ApiResponseResult } from "../../types";

export interface ResetPasswordCheckEmailServiceInterface {
  resetPasswordRequest: (
    email: string,
    sessionId: string
  ) => Promise<ApiResponseResult>;
}
