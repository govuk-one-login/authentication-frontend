import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants.js";
import type { ResetPasswordServiceInterface } from "./types.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request } from "express";

export function resetPasswordService(axios: Http = http): ResetPasswordServiceInterface {
  const updatePassword = async function (
    newPassword: string,
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    isForcedPasswordReset: boolean,
    req: Request
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.RESET_PASSWORD,
      {
        password: newPassword,
        isForcedPasswordReset: isForcedPasswordReset,
        allowMfaResetAfterPasswordReset: true,
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
