export interface MfaServiceInterface {
  sendMfaCode: (sessionId: string, emailAddress: string) => Promise<void>;
}

export interface UserSessionState {
  sessionState: string;
}
