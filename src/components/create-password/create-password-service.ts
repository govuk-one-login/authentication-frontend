import {
  createApiResponse,
  getRequestConfig,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants";
import { CreatePasswordServiceInterface } from "./types";
import { ApiResponseResult, DefaultApiResponse } from "../../types";

export function createPasswordService(
  axios: Http = http
): CreatePasswordServiceInterface {
  const signUpUser = async function (
    sessionId: string,
    emailAddress: string,
    password: string,
    sourceIp: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.SIGNUP_USER,
      {
        email: emailAddress,
        password: password,
      },
      getRequestConfig({
        sessionId: sessionId,
        sourceIp: sourceIp,
        persistentSessionId: persistentSessionId,
      })
    );

    return createApiResponse<DefaultApiResponse>(response, [
      HTTP_STATUS_CODES.NO_CONTENT,
    ]);
  };

  return {
    signUpUser,
  };
}
