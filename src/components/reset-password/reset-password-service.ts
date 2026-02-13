import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants.js";
import type { ResetPasswordServiceInterface } from "./types.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request, Response } from "express";

export function resetPasswordService(
  axios: Http = http
): ResetPasswordServiceInterface {
  const updatePassword = async function (
    newPassword: string,
    isForcedPasswordReset: boolean,
    req: Request,
    res: Response
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.RESET_PASSWORD,
      {
        password: newPassword,
        isForcedPasswordReset: isForcedPasswordReset,
        allowMfaResetAfterPasswordReset: true,
      },
      getInternalRequestConfigWithSecurityHeaders(
        req,
        res,
        API_ENDPOINTS.RESET_PASSWORD
      )
    );

    return createApiResponse<DefaultApiResponse>(response, [
      HTTP_STATUS_CODES.NO_CONTENT,
    ]);
  };

  return {
    updatePassword,
  };
}
