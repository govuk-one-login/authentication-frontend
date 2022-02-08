import { ClientInfoResponse, ClientInfoServiceInterface } from "./types";
import {
  createApiResponse,
  getRequestConfig,
  http,
  Http,
} from "../../../utils/http";
import { API_ENDPOINTS, SERVICE_TYPE } from "../../../app.constants";
import { ApiResponseResult } from "../../../types";

export function clientInfoService(
  axios: Http = http
): ClientInfoServiceInterface {
  const clientInfo = async function (
    sessionId: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<ClientInfoResponse>> {
    const response = await axios.client.get<ClientInfoResponse>(
      API_ENDPOINTS.CLIENT_INFO,
      getRequestConfig({
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        sourceIp: sourceIp,
        persistentSessionId: persistentSessionId,
      })
    );

    const result = createApiResponse<ClientInfoResponse>(response);

    if (result.success) {
      result.data.serviceType =
        result.data.serviceType ?? SERVICE_TYPE.MANDATORY;
    }

    return result;
  };

  return {
    clientInfo,
  };
}
