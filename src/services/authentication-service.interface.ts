export interface AuthenticationServiceInterface {
  userExists: (sessionId: string, emailAddress: string) => Promise<boolean>;
  signUpUser: (
    sessionId: string,
    emailAddress: string,
    password: string
  ) => Promise<string>;
  logInUser: (
    sessionId: string,
    emailAddress: string,
    password: string
  ) => Promise<boolean>;
}
