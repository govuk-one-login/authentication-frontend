import { ApiResponseResult } from "../../types";
import { API_ENDPOINTS } from "../../app.constants";
import {
  createApiResponse,
  getRequestConfig,
  http,
  Http,
} from "../../utils/http";
import { AuthCodeResponse, RpAuthCodeServiceInterface } from "./types";
import { getApiBaseUrl } from "../../config";

export function rpAuthCodeService(
  axios: Http = http
): RpAuthCodeServiceInterface {
  const getAuthCode = async function (
    sessionId: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<AuthCodeResponse>> {
    const baseUrl = getApiBaseUrl();
    const config = getRequestConfig({
      baseURL: baseUrl,
      sessionId: sessionId,
      clientSessionId: clientSessionId,
      sourceIp: sourceIp,
      persistentSessionId: persistentSessionId,
    });
    const response = await axios.client.get(API_ENDPOINTS.AUTH_CODE, config);

    return createApiResponse<AuthCodeResponse>(response);
  };

  return {
    getAuthCode,
  };
}
