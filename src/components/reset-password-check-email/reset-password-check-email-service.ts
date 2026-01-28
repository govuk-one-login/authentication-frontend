import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants.js";
import type { Request, Response } from "express";

import type {
  ResetPasswordCheckEmailServiceInterface,
  ResetPasswordRequestResponse,
} from "./types.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
export function resetPasswordCheckEmailService(
  axios: Http = http
): ResetPasswordCheckEmailServiceInterface {
  const resetPasswordRequest = async function (
    email: string,
    withinForcedPasswordResetJourney: boolean,
    req: Request,
    res: Response
  ): Promise<ApiResponseResult<ResetPasswordRequestResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.RESET_PASSWORD_REQUEST,
      {
        withinForcedPasswordResetJourney: withinForcedPasswordResetJourney,
        email: email,
      },
      getInternalRequestConfigWithSecurityHeaders(
        req,
        res,
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
