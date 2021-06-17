import { API_ENDPOINTS } from "../app.constants";
import { http } from "../utils/http";
import { User } from "./types/user";
import { UserSignupCredentials } from "./types/user-signup-credentials";

export async function userExists(emailAddress: string): Promise<boolean> {
  const { data } = await http.client.post<User>(API_ENDPOINTS.USER_EXISTS, {
    email: emailAddress,
  });

  return data.doesUserExist;
}

export async function signUpUser(
  emailAddress: string,
  password: string
): Promise<boolean> {
  const { data } = await http.client.post<UserSignupCredentials>(
    API_ENDPOINTS.SIGNUP_USER,
    {
      email: emailAddress,
      password: password,
    }
  );
  return true;
}
