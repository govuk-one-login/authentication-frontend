import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants";
import { ResetPasswordServiceInterface } from "./types";
import { ApiResponseResult, DefaultApiResponse } from "../../types";
import { Request } from "express";

export function resetPasswordService(
  axios: Http = http
): ResetPasswordServiceInterface {
  const updatePassword = async function (
    newPassword: string,
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    isForcedPasswordReset: boolean,
    allowMfaResetAfterPasswordReset: boolean,
    req: Request
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.RESET_PASSWORD,
      {
        password: newPassword,
        isForcedPasswordReset: isForcedPasswordReset,
        allowMfaResetAfterPasswordReset: allowMfaResetAfterPasswordReset,
      },
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          clientSessionId: clientSessionId,
          persistentSessionId: persistentSessionId,
        },
        req,
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
