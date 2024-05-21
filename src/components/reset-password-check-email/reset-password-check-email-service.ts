import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants";
import { Request } from "express";

import {
  ResetPasswordCheckEmailServiceInterface,
  ResetPasswordRequestResponse,
} from "./types";
import { ApiResponseResult, DefaultApiResponse } from "../../types";

export function resetPasswordCheckEmailService(
  axios: Http = http
): ResetPasswordCheckEmailServiceInterface {
  const resetPasswordRequest = async function (
    email: string,
    sessionId: string,
    sourceIp: string,
    clientSessionId: string,
    persistentSessionId: string,
    withinForcedPasswordResetJourney: boolean,
    req: Request
  ): Promise<ApiResponseResult<ResetPasswordRequestResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.RESET_PASSWORD_REQUEST,
      {
        withinForcedPasswordResetJourney: withinForcedPasswordResetJourney,
        email: email,
      },
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          sourceIp: sourceIp,
          clientSessionId: clientSessionId,
          persistentSessionId: persistentSessionId,
        },
        req,
        API_ENDPOINTS.RESET_PASSWORD_REQUEST
      )
    );
    return createApiResponse<ResetPasswordRequestResponse>(response, [
      HTTP_STATUS_CODES.OK,
      HTTP_STATUS_CODES.NO_CONTENT,
    ]);
  };
  return {
    resetPasswordRequest,
  };
}
