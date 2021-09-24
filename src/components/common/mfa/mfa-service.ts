import { MfaServiceInterface } from "./types";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants";
import { getRequestConfig, http, Http } from "../../../utils/http";
import { ApiResponse, ApiResponseResult } from "../../../types";

export function mfaService(axios: Http = http): MfaServiceInterface {
  const sendMfaCode = async function (
    sessionId: string,
    emailAddress: string
  ): Promise<ApiResponseResult> {
    const { data, status } = await axios.client.post<ApiResponse>(
      API_ENDPOINTS.MFA,
      {
        email: emailAddress,
      },
      getRequestConfig({
        sessionId: sessionId,
        validationStatues: [
          HTTP_STATUS_CODES.OK,
          HTTP_STATUS_CODES.BAD_REQUEST,
        ],
      })
    );

    return {
      success: status === HTTP_STATUS_CODES.OK,
      code: data.code,
      message: data.message,
      sessionState: data.sessionState,
    };
  };

  return {
    sendMfaCode,
  };
}
