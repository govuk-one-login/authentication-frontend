export interface AuthenticationServiceInterface {
  userExists: (emailAddress: string) => Promise<boolean>;
}
