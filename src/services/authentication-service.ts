import { API_ENDPOINTS, HTTP_STATUS_CODES, USER_STATE } from "../app.constants";
import { http } from "../utils/http";
import { UserExists } from "./types/user-exists";
import { UserLogin } from "./types/user-login";
import { UserSignup } from "./types/user-signup";

export async function userExists(
  sessionId: string,
  emailAddress: string
): Promise<boolean> {
  const config = {
    headers: {
      "Session-Id": sessionId,
    },
  };
  const { data } = await http.client.post<UserExists>(
    API_ENDPOINTS.USER_EXISTS,
    {
      email: emailAddress,
    },
    config
  );

  return data.doesUserExist;
}

export async function signUpUser(
  sessionId: string,
  emailAddress: string,
  password: string
): Promise<string> {
  const config = {
    headers: {
      "Session-Id": sessionId,
    },
  };

  const { data } = await http.client.post<UserSignup>(
    API_ENDPOINTS.SIGNUP_USER,
    {
      email: emailAddress,
      password: password,
    },
    config
  );
  return data.sessionState;
}

export async function logInUser(
  sessionId: string,
  emailAddress: string,
  password: string
): Promise<boolean> {
  const config = {
    headers: {
      "Session-Id": sessionId,
    },
    validateStatus: function (status: any) {
      return (
        status === HTTP_STATUS_CODES.OK ||
        status === HTTP_STATUS_CODES.UNAUTHORIZED
      );
    },
  };

  const { data } = await http.client.post<UserLogin>(
    API_ENDPOINTS.LOG_IN_USER,
    {
      email: emailAddress,
      password: password,
    },
    config
  );
  return data.sessionState && data.sessionState === USER_STATE.AUTHENTICATED;
}
