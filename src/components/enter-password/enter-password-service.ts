import { getRequestConfig, Http, http } from "../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants";
import { EnterPasswordServiceInterface, UserLogin } from "./types";

export function enterPasswordService(
  axios: Http = http
): EnterPasswordServiceInterface {
  const loginUser = async function (
    sessionId: string,
    emailAddress: string,
    password: string,
    clientSessionId: string,
    sourceIp: string
  ): Promise<UserLogin> {
    const { data } = await axios.client.post<UserLogin>(
      API_ENDPOINTS.LOG_IN_USER,
      {
        email: emailAddress,
        password: password,
      },
      getRequestConfig({
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        validationStatues: [
          HTTP_STATUS_CODES.OK,
          HTTP_STATUS_CODES.UNAUTHORIZED,
        ],
        sourceIp: sourceIp
      })
    );
    return data;
  };

  return {
    loginUser,
  };
}
