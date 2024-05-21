import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
import { CreatePasswordServiceInterface, SignUpResponse } from "./types";
import { ApiResponseResult } from "../../types";
import { Request } from "express";

export function createPasswordService(
  axios: Http = http
): CreatePasswordServiceInterface {
  const signUpUser = async function (
    sessionId: string,
    clientSessionId: string,
    emailAddress: string,
    password: string,
    sourceIp: string,
    persistentSessionId: string,
    req: Request
  ): Promise<ApiResponseResult<SignUpResponse>> {
    const response = await axios.client.post<SignUpResponse>(
      API_ENDPOINTS.SIGNUP_USER,
      {
        email: emailAddress,
        password: password,
      },
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          clientSessionId: clientSessionId,
          sourceIp: sourceIp,
          persistentSessionId: persistentSessionId,
        },
        req,
        API_ENDPOINTS.SIGNUP_USER
      )
    );

    return createApiResponse<SignUpResponse>(response);
  };

  return {
    signUpUser,
  };
}
