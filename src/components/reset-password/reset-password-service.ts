import { getBaseRequestConfig, Http, http } from "../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants";
import { ResetPasswordServiceInterface } from "./types";
import { ApiResponse, ApiResponseResult } from "../../types";

export function resetPasswordService(
  axios: Http = http
): ResetPasswordServiceInterface {
  const updatePassword = async function (
    newPassword: string,
    code: string
  ): Promise<ApiResponseResult> {
    const config = getBaseRequestConfig("sessionId");
    config.validateStatus = (status: number) => {
      return (
        status === HTTP_STATUS_CODES.OK ||
        status === HTTP_STATUS_CODES.BAD_REQUEST
      );
    };

    const { data, status } = await axios.client.post<ApiResponse>(
      API_ENDPOINTS.RESET_PASSWORD,
      {
        password: newPassword,
        code,
      },
      config
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
