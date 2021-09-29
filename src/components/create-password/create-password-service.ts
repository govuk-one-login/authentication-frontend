import {
  createApiResponse,
  getRequestConfig,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
import { CreatePasswordServiceInterface } from "./types";
import { ApiResponse, ApiResponseResult } from "../../types";

export function createPasswordService(
  axios: Http = http
): CreatePasswordServiceInterface {
  const signUpUser = async function (
    sessionId: string,
    emailAddress: string,
    password: string,
    sourceIp: string
  ): Promise<ApiResponseResult> {
    const response = await axios.client.post<ApiResponse>(
      API_ENDPOINTS.SIGNUP_USER,
      {
        email: emailAddress,
        password: password,
      },
      getRequestConfig({ sessionId: sessionId, sourceIp: sourceIp })
    );

    return createApiResponse(response);
  };

  return {
    signUpUser,
  };
}
