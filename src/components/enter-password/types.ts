export interface UserLogin {
  sessionState: string;
}

export interface EnterPasswordServiceInterface {
  loginUser: (
    sessionId: string,
    email: string,
    password: string
  ) => Promise<boolean>;
}
