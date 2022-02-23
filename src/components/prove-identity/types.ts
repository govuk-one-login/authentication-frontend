import { ApiResponseResult, DefaultApiResponse } from "../../types";

export interface IPVAuthorisationResponse extends DefaultApiResponse {
  redirectUri?: string;
}

export interface ProveIdentityServiceInterface {
  ipvAuthorize: (
    sessionId: string,
    clientSessionId: string,
    emailAddress: string,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<IPVAuthorisationResponse>>;
}
