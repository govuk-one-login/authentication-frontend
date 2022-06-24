import {
  createApiResponse,
  getRequestConfig,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants";
import { ApiResponseResult, DefaultApiResponse } from "../../types";

export function setupAuthAppService(axios: Http = http): any {
  const verifyAccessCode = async function (
    code: string,
    sourceIp: string,
    sessionId: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.VERIFY_MFA_CODE,
      {
        code: code,
      },
      getRequestConfig({
        sourceIp: sourceIp,
        sessionId: sessionId,
        persistentSessionId: persistentSessionId,
      })
    );

    return createApiResponse<DefaultApiResponse>(response, [
      HTTP_STATUS_CODES.NO_CONTENT,
      HTTP_STATUS_CODES.BAD_REQUEST,
    ]);
  };

  return {
    verifyAccessCode,
  };
}
