import {
  createApiResponse,
  getRequestConfig,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants";

import { ResetPasswordCheckEmailServiceInterface } from "./types";
import { ApiResponseResult, DefaultApiResponse } from "../../types";

export function resetPasswordCheckEmailService(
  axios: Http = http
): ResetPasswordCheckEmailServiceInterface {
  const resetPasswordRequest = async function (
    email: string,
    sessionId: string,
    sourceIp: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.RESET_PASSWORD_REQUEST,
      {
        email: email,
        useCodeFlow: true
      },
      getRequestConfig({
        sessionId: sessionId,
        sourceIp: sourceIp,
        persistentSessionId: persistentSessionId,
      })
    );
    return createApiResponse<DefaultApiResponse>(response, [
      HTTP_STATUS_CODES.NO_CONTENT,
    ]);
  };
  return {
    resetPasswordRequest,
  };
}
