import { ApiResponseResult, DefaultApiResponse } from "../../types";

export interface CheckReauthServiceInterface {
  checkReauthUsers: (
    sessionId: string,
    email: string,
    sub: string,
    sourceIp: string,
    clientSessionId: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
