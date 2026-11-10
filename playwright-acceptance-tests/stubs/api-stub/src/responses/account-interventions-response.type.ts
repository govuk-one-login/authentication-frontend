export interface AccountInterventionsResponse {
  status: number;
  body: {
    passwordResetRequired: boolean;
    blocked: boolean;
    temporarilySuspended: boolean;
    reproveIdentity: boolean;
  };
}
