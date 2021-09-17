export interface ResetPasswordCheckEmailServiceInterface {
  resetPasswordRequest: (
    email: string,
    sessionId: string
  ) => Promise<ResetPasswordRequestResponse>;
}

export interface ResetPasswordRequestResponse {
  sessionState: string;
}
