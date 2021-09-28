export interface AccountNotFoundServiceInterface {
  sendEmailVerificationNotification: (
    sessionId: string,
    email: string,
    sourceIp: string
  ) => Promise<void>;
}
