export interface UserLogin {
  redactedPhoneNumber: string;
  sessionState: string;
}

export interface EnterPasswordServiceInterface {
  loginUser: (
    sessionId: string,
    email: string,
    password: string,
    clientSessionId: string
  ) => Promise<UserLogin>;
}
