import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
import { ApiResponseResult } from "../../types";
import {
  ProcessIdentityResponse,
  ProveIdentityCallbackServiceInterface,
} from "./types";
import { Request } from "express";

export function proveIdentityCallbackService(
  axios: Http = http
): ProveIdentityCallbackServiceInterface {
  const identityProcessed = async function (
    email: string,
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ): Promise<ApiResponseResult<ProcessIdentityResponse>> {
    const response = await axios.client.post<ProcessIdentityResponse>(
      API_ENDPOINTS.IPV_PROCESSING_IDENTITY,
      { email: email },
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          clientSessionId: clientSessionId,
          persistentSessionId: persistentSessionId,
        },
        req,
        API_ENDPOINTS.IPV_PROCESSING_IDENTITY
      )
    );

    return createApiResponse<ProcessIdentityResponse>(response);
  };

  return {
    processIdentity: identityProcessed,
  };
}
