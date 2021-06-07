export interface User {
  useEmailExists: (emailAddress: string) => boolean;
  addUser: (
    emailAddress: string,
    password: string,

  ) => boolean;
}

export class UserService implements User {
  addUser(
    emailAddress: string,
    password: string,
  ): boolean {
    return false;
  }

  useEmailExists(emailAddress: string): boolean {
    return emailAddress === 'test@test.com' ? true : false;
  }
}
