export interface VerifyCodeInterface {
  verifyCode: (
    sessionId: string,
    code: string,
    notificationType: string
  ) => Promise<string>;
}

export interface VerifyCode {
  sessionState: string;
}
