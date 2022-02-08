import { ApiResponseResult } from "../../types";
import { API_ENDPOINTS } from "../../app.constants";
import {
  createApiResponse,
  getRequestConfig,
  http,
  Http,
} from "../../utils/http";
import { AuthCodeResponse } from "./types";
import { getApiBaseUrl } from "../../config";

export function authCodeService(axios: Http = http): any {
  const getAuthCode = async function (
    sessionId: string,
    sourceIp: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<AuthCodeResponse>> {
    const response = await axios.client.get(
      API_ENDPOINTS.AUTH_CODE,
      getRequestConfig({
        baseURL: getApiBaseUrl(),
        sessionId: sessionId,
        sourceIp: sourceIp,
        persistentSessionId: persistentSessionId,
      })
    );

    return createApiResponse<AuthCodeResponse>(response);
  };

  return {
    getAuthCode,
  };
}
