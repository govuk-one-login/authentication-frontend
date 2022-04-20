import { ApiResponseResult, DefaultApiResponse } from "../../types";

export interface DocCheckingAuthorisationResponse extends DefaultApiResponse {
  redirectUri?: string;
}

export interface DocCheckingAppInterface {
  docCheckingAppAuthorize: (
    sessionId: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<DocCheckingAuthorisationResponse>>;
}
