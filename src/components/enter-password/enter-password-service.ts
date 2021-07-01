import { getBaseRequestConfig, Http, http } from "../../utils/http";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  USER_STATE,
} from "../../app.constants";
import { EnterPasswordServiceInterface, UserLogin } from "./types";

export function enterPasswordService(
  axios: Http = http
): EnterPasswordServiceInterface {
  const loginUser = async function (
    sessionId: string,
    emailAddress: string,
    password: string
  ): Promise<boolean> {
    const config = getBaseRequestConfig(sessionId);
    config.validateStatus = function (status: any) {
      return (
        status === HTTP_STATUS_CODES.OK ||
        status === HTTP_STATUS_CODES.UNAUTHORIZED
      );
    };

    const { data } = await axios.client.post<UserLogin>(
      API_ENDPOINTS.LOG_IN_USER,
      {
        email: emailAddress,
        password: password,
      },
      config
    );
    return data.sessionState && data.sessionState === USER_STATE.AUTHENTICATED;
  };

  return {
    loginUser,
  };
}
