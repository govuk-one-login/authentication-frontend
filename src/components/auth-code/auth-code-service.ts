import { ApiResponseResult } from "../../types";
import { API_ENDPOINTS } from "../../app.constants";
import {
  createApiResponse,
  getRequestConfig,
  http,
  Http,
} from "../../utils/http";
import { AuthCodeResponse, AuthCodeServiceInterface } from "./types";
import { getApiBaseUrl } from "../../config";

export function authCodeService(axios: Http = http): AuthCodeServiceInterface {
  const getAuthCode = async function (
    sessionId: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<AuthCodeResponse>> {
    const response = await axios.client.get(
      API_ENDPOINTS.AUTH_CODE,
      getRequestConfig({
        baseURL: getApiBaseUrl(),
        sessionId: sessionId,
        clientSessionId: clientSessionId,
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
