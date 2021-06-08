export interface UserService {
  useEmailExists: (emailAddress: string) => boolean;
  addUser: (
    emailAddress: string,
    password: string,

  ) => boolean;
}
