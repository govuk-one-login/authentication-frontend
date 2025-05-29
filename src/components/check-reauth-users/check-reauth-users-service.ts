import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants.js";
import type { CheckReauthServiceInterface } from "./types.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request } from "express";

export function checkReauthUsersService(axios: Http = http): CheckReauthServiceInterface {
  const checkReauthUsers = async function (
    sessionId: string,
    emailAddress: string,
    sub: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const lowerCaseEmail = emailAddress.toLowerCase();
    const config = getInternalRequestConfigWithSecurityHeaders(
      {
        sessionId,
        validationStatuses: [
          HTTP_STATUS_CODES.OK,
          HTTP_STATUS_CODES.BAD_REQUEST,
          HTTP_STATUS_CODES.NOT_FOUND,
        ],
        clientSessionId,
        persistentSessionId,
      },
      req,
      API_ENDPOINTS.CHECK_REAUTH_USER
    );

    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.CHECK_REAUTH_USER,
      { email: lowerCaseEmail, rpPairwiseId: sub },
      config
    );

    return createApiResponse<DefaultApiResponse>(response);
  };

  return { checkReauthUsers };
}
