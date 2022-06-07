import {
  createApiResponse,
  getRequestConfig,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
import { ApiResponseResult } from "../../types";
import {
  ProcessIdentityResponse,
  ProveIdentityCallbackServiceInterface,
} from "./types";

export function proveIdentityCallbackService(
  axios: Http = http
): ProveIdentityCallbackServiceInterface {
  const identityProcessed = async function (
    email: string,
    sourceIp: string,
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<ProcessIdentityResponse>> {
    const response = await axios.client.post<ProcessIdentityResponse>(
      API_ENDPOINTS.IPV_PROCESSING_IDENTITY,
      { email: email },
      getRequestConfig({
        sourceIp: sourceIp,
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        persistentSessionId: persistentSessionId,
      })
    );

    return createApiResponse<ProcessIdentityResponse>(response);
  };

  return {
    processIdentity: identityProcessed,
  };
}
