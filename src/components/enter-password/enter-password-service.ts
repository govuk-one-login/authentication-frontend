import {
  createApiResponse,
  getRequestConfig,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants";
import { EnterPasswordServiceInterface, UserLoginResponse } from "./types";
import { ApiResponseResult } from "../../types";

export function enterPasswordService(
  axios: Http = http
): EnterPasswordServiceInterface {
  const loginUser = async function (
    sessionId: string,
    emailAddress: string,
    password: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<UserLoginResponse>> {
    const response = await axios.client.post<UserLoginResponse>(
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
          HTTP_STATUS_CODES.BAD_REQUEST,
        ],
        sourceIp: sourceIp,
        persistentSessionId: persistentSessionId,
      })
    );

    return createApiResponse<UserLoginResponse>(response);
  };

  return {
    loginUser,
  };
}
