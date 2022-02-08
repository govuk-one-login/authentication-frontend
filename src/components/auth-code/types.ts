import { ApiResponseResult, DefaultApiResponse } from "../../types";

export interface AuthCodeResponse extends DefaultApiResponse {
  location: string;
}

export interface AuthCodeServiceInterface {
  getAuthCode: (
    sessionId: string,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<AuthCodeResponse>>;
}
