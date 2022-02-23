import {
  createApiResponse,
  getRequestConfig,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
import { CreatePasswordServiceInterface, SignUpResponse } from "./types";
import { ApiResponseResult } from "../../types";

export function createPasswordService(
  axios: Http = http
): CreatePasswordServiceInterface {
  const signUpUser = async function (
    sessionId: string,
    emailAddress: string,
    password: string,
    sourceIp: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<SignUpResponse>> {
    const response = await axios.client.post<SignUpResponse>(
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

    return createApiResponse<SignUpResponse>(response);
  };

  return {
    signUpUser,
  };
}
