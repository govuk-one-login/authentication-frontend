import { ApiResponseResult } from "../../../types";

export interface VerifyCodeInterface {
  verifyCode: (
    sessionId: string,
    code: string,
    notificationType: string
  ) => Promise<ApiResponseResult>;
}
