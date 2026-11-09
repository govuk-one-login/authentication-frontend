import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request } from "express";

export interface AmcAuthorizeResponse extends DefaultApiResponse {
  redirectUrl: string;
  amcCookie: string;
}

export interface AmcAuthorizeInterface {
  getRedirectUrl: (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    journeyType: string
  ) => Promise<ApiResponseResult<AmcAuthorizeResponse>>;
}

export interface AMCResultInterface<T> {
  getAMCResult: (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    code: string,
    state: string,
    usedRedirectUrl: string,
    language: string
  ) => Promise<AMCServiceResult<T>>;
}

export type AMCServiceResult<T> =
  { success: true; data: T } | { success: false; data: DefaultApiResponse };

export enum AMC_SCOPE {
  PASSKEY_CREATE = "passkey-create",
  ACCOUNT_DELETE = "account-delete",
}

export enum AMC_ERROR_DESCRIPTION {
  USER_BACKED_OUT_OF_JOURNEY = "UserBackedOutOfJourney",
  USER_ABORTED_JOURNEY = "UserAbortedJourney",
  ACCOUNT_HAS_INTERVENTIONS = "AccountHasInterventions",
}

export interface AMCOutcome {
  sub: string;
  outcome_id: string;
  email: string;
  scope: AMC_SCOPE;
  success: boolean;
  actions: AMCAction[];
}

export interface AMCAction {
  action: AMC_SCOPE;
  startedAt: number;
  completedAt: number;
  success: boolean;
  details: AMCActionErrorDetails;
}

export interface AMCActionErrorDetails {
  error: {
    code: number;
    description: AMC_ERROR_DESCRIPTION;
  };
}
