import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  Http,
  http,
} from "../../utils/http.js";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants.js";
import { Request } from "express";

import {
  ResetPasswordCheckEmailServiceInterface,
  ResetPasswordRequestResponse,
} from "./types.js";
import { ApiResponseResult, DefaultApiResponse } from "../../types.js";
export function resetPasswordCheckEmailService(
  axios: Http = http
): ResetPasswordCheckEmailServiceInterface {
  const resetPasswordRequest = async function (
    email: string,
    sessionId: string,
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
