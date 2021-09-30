import { ClientInfoResponse, ClientInfoServiceInterface } from "./types";
import {
  createApiResponse,
  getRequestConfig,
  http,
  Http,
} from "../../../utils/http";
import { API_ENDPOINTS } from "../../../app.constants";

export function clientInfoService(
  axios: Http = http
): ClientInfoServiceInterface {
  const clientInfo = async function (
    sessionId: string,
    clientSessionId: string,
    sourceIp: string
  ): Promise<ClientInfoResponse> {
    const response = await axios.client.get(
      API_ENDPOINTS.CLIENT_INFO,
      getRequestConfig({
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        sourceIp: sourceIp,
      })
    );

    const res = createApiResponse(response) as ClientInfoResponse;

    res.data = {
      clientId: response.data.client_id,
      clientName: response.data.client_name,
      scopes: response.data.scopes,
      redirectUri: response.data.redirectUri,
      serviceType: response.data.service_type,
      state: response.data.state,
    };

    return res;
  };

  return {
    clientInfo,
  };
}
