export interface VerifyCode {
  sessionState: string;
}

export interface VerifyEmailServiceInterface {
  verifyEmailCode: (sessionId: string, code: string) => Promise<boolean>;
}
