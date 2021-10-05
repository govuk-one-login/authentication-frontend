import {
  createApiResponse,
  getRequestConfig,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants";
import { ResetPasswordServiceInterface } from "./types";
import { ApiResponse, ApiResponseResult } from "../../types";

export function resetPasswordService(
  axios: Http = http
): ResetPasswordServiceInterface {
  const updatePassword = async function (
    newPassword: string,
    code: string,
    sourceIp: string
  ): Promise<ApiResponseResult> {
    const response = await axios.client.post<ApiResponse>(
      API_ENDPOINTS.RESET_PASSWORD,
      {
        password: newPassword,
        code,
      },
      getRequestConfig({
        sourceIp: sourceIp,
      })
    );

    return createApiResponse(response, HTTP_STATUS_CODES.NO_CONTENT);
  };

  return {
    updatePassword,
  };
}
