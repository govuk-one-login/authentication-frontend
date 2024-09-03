import { AuthorizeServiceInterface, StartAuthResponse } from "./types";
import { ApiResponseResult } from "../../types";
import { API_ENDPOINTS } from "../../app.constants";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
  Http,
} from "../../utils/http";
import { supportReauthentication } from "../../config";
import { Request } from "express";

export function authorizeService(
  axios: Http = http
): AuthorizeServiceInterface {
  const start = async function (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    reauthenticate?: string,
    oldSessionId?: string
  ): Promise<ApiResponseResult<StartAuthResponse>> {
    let reauthenticateOption = undefined;
    if (supportReauthentication() && reauthenticate) {
      reauthenticateOption = reauthenticate !== "";
    }
    const body = oldSessionId ? { "old-session-id": oldSessionId } : {};
    const response = await axios.client.post<StartAuthResponse>(
      API_ENDPOINTS.START,
      body,
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          clientSessionId: clientSessionId,
          persistentSessionId: persistentSessionId,
          reauthenticate: reauthenticateOption,
        },
        req,
        API_ENDPOINTS.START
      )
    );

    return createApiResponse<StartAuthResponse>(response);
  };

  return {
    start,
  };
}
