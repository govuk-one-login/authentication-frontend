import { getRequestConfig, Http, http } from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";

import { ClientInfoResponse, SignInOrCreateServiceInterface } from "./types";

export function signInOrCreateService(
  axios: Http = http
): SignInOrCreateServiceInterface {
  const clientInfo = async function (
    sessionId: string,
    clientSessionId: string
  ): Promise<ClientInfoResponse> {
    const { data } = await axios.client.get<ClientInfoResponse>(
      API_ENDPOINTS.CLIENT_INFO,
      getRequestConfig({
        sessionId: sessionId,
        clientSessionId: clientSessionId,
      })
    );
    return data;
  };
  return {
    clientInfo,
  };
}
