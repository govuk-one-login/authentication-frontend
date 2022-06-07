import { ApiResponseResult, DefaultApiResponse } from "../../types";

export interface ProveIdentityCallbackServiceInterface {
  processIdentity: (
    email: string,
    sourceIp: string,
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<ProcessIdentityResponse>>;
}

export interface ProcessIdentityResponse extends DefaultApiResponse {
  status: IdentityProcessingStatus;
}

export enum IdentityProcessingStatus {
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
  PROCESSING = "PROCESSING",
}
