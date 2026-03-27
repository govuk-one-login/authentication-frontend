import type { Request } from "express";

export enum AMC_SCOPE {
  PASSKEY_CREATE = "passkey-create",
  ACCOUNT_DELETE = "account-delete",
}

export enum AMC_ERROR_DESCRIPTION {
  USER_BACKED_OUT_OF_JOURNEY = "UserBackedOutOfJourney",
  USER_ABORTED_JOURNEY = "UserAbortedJourney",
}

export interface CreatePasskeyResultSuccessResponse {
  sub: string;
  outcome_id: string;
  email: string;
  scope: AMC_SCOPE;
  success: boolean;
  journeys: AMCJourney[];
}

export interface AMCJourney {
  journey: AMC_SCOPE;
  timestamp: number;
  success: boolean;
  details: AMCJourneyErrorDetails;
}

export interface AMCJourneyErrorDetails {
  error: {
    code: number;
    description: AMC_ERROR_DESCRIPTION;
  };
}

export interface ErrorConfiguration {
  errorEvent: string;
  updateSession: (req: Request) => Promise<void>;
}
