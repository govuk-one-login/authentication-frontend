import { API_ENDPOINTS } from "../app.constants";
import { http } from "../utils/http";
import { UserExists } from "./types/user-exists";
import { UserSignup } from "./types/user-signup";

export async function userExists(
  sessionId: string,
  emailAddress: string
): Promise<boolean> {
  http.sessionId = sessionId;

  const { data } = await http.client.post<UserExists>(
    API_ENDPOINTS.USER_EXISTS,
    {
      email: emailAddress,
    }
  );

  return data.doesUserExist;
}

export async function signUpUser(
  sessionId: string,
  emailAddress: string,
  password: string
): Promise<string> {
  http.sessionId = sessionId;

  const { data } = await http.client.post<UserSignup>(
    API_ENDPOINTS.SIGNUP_USER,
    {
      email: emailAddress,
      password: password,
    }
  );
  return data.state;
}
