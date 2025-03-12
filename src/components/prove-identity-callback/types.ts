import { ApiResponseResult, DefaultApiResponse } from "../../types";
import { Request } from "express";

export interface ProveIdentityCallbackServiceInterface {
  processIdentity: (
    email: string,
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ) => Promise<ApiResponseResult<ProcessIdentityResponse>>;
  generateSuccessfulRpReturnUrl: (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ) => Promise<string>;
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
