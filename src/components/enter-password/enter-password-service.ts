import {
  getBaseRequestConfigWithClientSession,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants";
import { EnterPasswordServiceInterface, UserLogin } from "./types";

export function enterPasswordService(
  axios: Http = http
): EnterPasswordServiceInterface {
  const loginUser = async function (
    sessionId: string,
    emailAddress: string,
    password: string,
    clientSessionId: string
  ): Promise<UserLogin> {
    const config = getBaseRequestConfigWithClientSession(
      sessionId,
      clientSessionId
    );
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
    return data;
  };

  return {
    loginUser,
  };
}
