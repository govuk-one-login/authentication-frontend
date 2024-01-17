import { ApiResponseResult, DefaultApiResponse } from "../../types";

export interface CheckReauthServiceInterface {
  checkReauthUsers: (
    sessionId: string,
    email: string,
    sourceIp: string,
    clientSessionId: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
