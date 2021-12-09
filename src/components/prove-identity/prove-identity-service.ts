import {
  createApiResponse,
  getRequestConfig,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
import {
  IPVAuthorisationResponse,
  ProveIdentityServiceInterface,
} from "./types";

export function proveIdentityService(
  axios: Http = http
): ProveIdentityServiceInterface {
  const ipvAuthorize = async function (
    sessionId: string,
    clientSessionId: string,
    emailAddress: string,
    sourceIp: string,
    persistentSessionId: string
  ): Promise<IPVAuthorisationResponse> {
    const response = await axios.client.post<IPVAuthorisationResponse>(
      API_ENDPOINTS.IPV_AUTHORIZE,
      {
        email: emailAddress,
      },
      getRequestConfig({
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        sourceIp: sourceIp,
        persistentSessionId: persistentSessionId,
      })
    );
    const apiResponse = createApiResponse(response) as IPVAuthorisationResponse;
    apiResponse.redirectUri = response.data.redirectUri;

    return apiResponse;
  };

  return {
    ipvAuthorize,
  };
}
