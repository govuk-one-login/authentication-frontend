import { ApiResponseResult, DefaultApiResponse } from "../../../types";

export interface VerifyCodeInterface {
  verifyCode: (
    sessionId: string,
    code: string,
    notificationType: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
