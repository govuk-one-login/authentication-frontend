import { Http, http } from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
import { CreatePasswordServiceInterface, UserSignup } from "./types";

export function createPasswordService(
  axios: Http = http
): CreatePasswordServiceInterface {
  const signUpUser = async function (
    sessionId: string,
    emailAddress: string,
    password: string
  ): Promise<string> {
    const config = {
      headers: {
        "Session-Id": sessionId,
      },
    };

    const { data } = await axios.client.post<UserSignup>(
      API_ENDPOINTS.SIGNUP_USER,
      {
        email: emailAddress,
        password: password,
      },
      config
    );
    return data.sessionState;
  };

  return {
    signUpUser,
  };
}
