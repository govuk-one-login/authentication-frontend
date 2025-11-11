import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request, Response } from "express";

export interface ProveIdentityCallbackServiceInterface {
  processIdentity: (
    email: string,
    req: Request,
    res: Response
  ) => Promise<ApiResponseResult<ProcessIdentityResponse>>;
  generateSuccessfulRpReturnUrl: (
    req: Request,
    res: Response
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
