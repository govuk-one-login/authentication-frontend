export interface AccountNotFoundServiceInterface {
  sendEmailVerificationNotification: (
    sessionId: string,
    email: string
  ) => Promise<void>;
}
