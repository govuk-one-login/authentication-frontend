export interface UserExists {
  email: string;
  doesUserExist: boolean;
  state: string;
}

export interface EnterEmailServiceInterface {
  sendEmailVerificationNotification: (
    sessionId: string,
    email: string
  ) => Promise<void>;
  userExists: (sessionId: string, emailAddress: string) => Promise<boolean>;
}
