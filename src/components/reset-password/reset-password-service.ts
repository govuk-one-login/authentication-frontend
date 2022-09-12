import {
  createApiResponse,
  getRequestConfig,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants";
import { ResetPasswordServiceInterface } from "./types";
import { ApiResponseResult, DefaultApiResponse } from "../../types";

export function resetPasswordService(
  axios: Http = http
): ResetPasswordServiceInterface {
  const updatePassword = async function (
    newPassword: string,
    sourceIp: string,
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.RESET_PASSWORD,
      {
        password: newPassword,
      },
      getRequestConfig({
        sourceIp: sourceIp,
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        persistentSessionId: persistentSessionId,
      })
    );

    return createApiResponse<DefaultApiResponse>(response, [
      HTTP_STATUS_CODES.NO_CONTENT,
    ]);
  };

  return {
    updatePassword,
  };
}
