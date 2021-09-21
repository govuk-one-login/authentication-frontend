import { ApiResponseResult } from "../../types";

export interface ResetPasswordServiceInterface {
  updatePassword: (
    newPassword: string,
    code: string
  ) => Promise<ApiResponseResult>;
}
