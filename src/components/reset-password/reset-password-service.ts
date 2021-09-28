import { getRequestConfig, Http, http } from "../../utils/http";
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
    const { data, status } = await axios.client.post<ApiResponse>(
      API_ENDPOINTS.RESET_PASSWORD,
      {
        password: newPassword,
        code,
      },
      getRequestConfig({
        validationStatues: [
          HTTP_STATUS_CODES.OK,
          HTTP_STATUS_CODES.BAD_REQUEST,
        ],
        sourceIp: sourceIp
      })
    );

    return {
      success: status === HTTP_STATUS_CODES.OK,
      code: data.code,
      message: data.message,
    };
  };

  return {
    updatePassword,
  };
}
