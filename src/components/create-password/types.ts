export interface UserSignup {
  sessionState: string;
}

export interface CreatePasswordServiceInterface {
  signUpUser: (
    sessionId: string,
    emailAddress: string,
    password: string
  ) => Promise<string>;
}
