import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import { API_ENDPOINTS } from "../../app.constants.js";
import type { EnterEmailServiceInterface, UserExists } from "./types.js";
import type { ApiResponseResult } from "../../types.js";
import type { Request } from "express";

export function enterEmailService(
  axios: Http = http
): EnterEmailServiceInterface {
  const userExists = async function (
    sessionId: string,
    emailAddress: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ): Promise<ApiResponseResult<UserExists>> {
    const response = await axios.client.post<UserExists>(
      API_ENDPOINTS.USER_EXISTS,
      {
        email: emailAddress.toLowerCase(),
      },
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          clientSessionId: clientSessionId,
          persistentSessionId: persistentSessionId,
        },
        req,
        API_ENDPOINTS.USER_EXISTS
      )
    );

    return createApiResponse<UserExists>(response);
  };

  return {
    userExists,
  };
}
