import {
  createApiResponse,
  getRequestConfig,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants";

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
    persistentSessionId: string
  ): Promise<ApiResponseResult<ResetPasswordRequestResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.RESET_PASSWORD_REQUEST,
      {
        email: email,
      },
      getRequestConfig({
        sessionId: sessionId,
        sourceIp: sourceIp,
        clientSessionId: clientSessionId,
        persistentSessionId: persistentSessionId,
      })
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
