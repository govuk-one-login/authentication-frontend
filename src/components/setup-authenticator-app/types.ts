import { ApiResponseResult, DefaultApiResponse } from "../../types";

export interface AuthAppServiceInterface {
  verifyAccessCode: (
    code: string,
    sourceIp: string,
    sessionId: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
