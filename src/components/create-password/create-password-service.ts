import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
import { CreatePasswordServiceInterface } from "./types";
import { ApiResponseResult, DefaultApiResponse } from "../../types";
import { Request } from "express";

export function createPasswordService(
  axios: Http = http
): CreatePasswordServiceInterface {
  const signUpUser = async function (
    sessionId: string,
    clientSessionId: string,
    emailAddress: string,
    password: string,
    persistentSessionId: string,
    req: Request
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.SIGNUP_USER,
      {
        email: emailAddress,
        password: password,
      },
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          clientSessionId: clientSessionId,
          persistentSessionId: persistentSessionId,
        },
        req,
        API_ENDPOINTS.SIGNUP_USER
      )
    );

    return createApiResponse<DefaultApiResponse>(response);
  };

  return {
    signUpUser,
  };
}
