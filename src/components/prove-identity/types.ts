import { ApiResponseResult } from "../../types";

export interface IPVAuthorisationResponse extends ApiResponseResult {
  redirectUri?: string;
}

export interface ProveIdentityServiceInterface {
  ipvAuthorize: (
    sessionId: string,
    clientSessionId: string,
    emailAddress: string,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<IPVAuthorisationResponse>;
}
