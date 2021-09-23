import { MfaServiceInterface } from "./types";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants";
import { getBaseRequestConfig, http, Http } from "../../../utils/http";
import { ApiResponse, ApiResponseResult } from "../../../types";

export function mfaService(axios: Http = http): MfaServiceInterface {
  const sendMfaCode = async function (
    sessionId: string,
    emailAddress: string
  ): Promise<ApiResponseResult> {
    const config = getBaseRequestConfig(sessionId);
    config.validateStatus = function (status: number) {
      return (
        status === HTTP_STATUS_CODES.OK ||
        status === HTTP_STATUS_CODES.BAD_REQUEST
      );
    };

    const { data, status } = await axios.client.post<ApiResponse>(
      API_ENDPOINTS.MFA,
      {
        email: emailAddress,
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
    sendMfaCode,
  };
}
