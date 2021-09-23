import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants";
import {
  createApiResponse,
  getRequestConfig,
  http,
  Http,
} from "../../../utils/http";
import { ApiResponse, ApiResponseResult } from "../../../types";
import { VerifyCodeInterface } from "./types";

export function codeService(axios: Http = http): VerifyCodeInterface {
  const verifyCode = async function (
    sessionId: string,
    code: string,
    notificationType: string
  ): Promise<ApiResponseResult> {
    const response = await axios.client.post<ApiResponse>(
      API_ENDPOINTS.VERIFY_CODE,
      {
        code,
        notificationType,
      },
      getRequestConfig({
        sessionId: sessionId,
        validationStatues: [
          HTTP_STATUS_CODES.OK,
          HTTP_STATUS_CODES.BAD_REQUEST,
        ],
      })
    );

    return createApiResponse(response);
  };

  return {
    verifyCode,
  };
}
