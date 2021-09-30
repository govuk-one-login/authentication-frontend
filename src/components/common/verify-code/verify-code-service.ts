import { API_ENDPOINTS } from "../../../app.constants";
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
    notificationType: string,
    clientSessionId: string,
    sourceIp: string
  ): Promise<ApiResponseResult> {
    const response = await axios.client.post<ApiResponse>(
      API_ENDPOINTS.VERIFY_CODE,
      {
        code,
        notificationType,
      },
      getRequestConfig({
        sessionId,
        clientSessionId,
        sourceIp: sourceIp,
      })
    );

    return createApiResponse(response);
  };

  return {
    verifyCode,
  };
}
