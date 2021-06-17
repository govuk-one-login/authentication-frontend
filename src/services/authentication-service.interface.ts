export interface AuthenticationServiceInterface {
  userExists: (emailAddress: string) => Promise<boolean>;
  signUpUser: (emailAddress: string, password: string) => Promise<boolean>;
}
