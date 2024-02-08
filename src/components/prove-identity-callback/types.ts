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

export type ProcessIdentityResponse =
  | ProcessIdentitySPOTResponse
  | ProcessIdentityInterventionResponse;

interface ProcessIdentitySPOTResponse extends DefaultApiResponse {
  status:
    | IdentityProcessingStatus.COMPLETED
    | IdentityProcessingStatus.PROCESSING
    | IdentityProcessingStatus.ERROR;
}

interface ProcessIdentityInterventionResponse extends DefaultApiResponse {
  status: IdentityProcessingStatus.INTERVENTION;
  redirectUrl: string;
}

export enum IdentityProcessingStatus {
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
  PROCESSING = "PROCESSING",
  INTERVENTION = "INTERVENTION",
}
