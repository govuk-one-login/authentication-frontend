import { ApiResponseResult } from "../../types";

export interface ResetPasswordServiceInterface {
  updatePassword: (
    newPassword: string,
    code: string,
    sourceIp: string,
    sessionId: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult>;
}
