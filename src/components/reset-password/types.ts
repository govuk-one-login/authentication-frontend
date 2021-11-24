import { ApiResponseResult } from "../../types";

export interface ResetPasswordServiceInterface {
  updatePassword: (
    newPassword: string,
    code: string,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult>;
}
