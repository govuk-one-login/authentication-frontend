import type { SfadAuthorizeInterface, SfadAuthorizeResponse } from "./types.js";
import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import type { ApiResponseResult } from "../../types.js";
import { AMC_JOURNEY_TYPES, API_ENDPOINTS } from "../../app.constants.js";
import type { Request } from "express";

export function sfadAuthorizeService(
  axios: Http = http
): SfadAuthorizeInterface {
  const getRedirectUrl = async function (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ): Promise<ApiResponseResult<SfadAuthorizeResponse>> {
    const config = getInternalRequestConfigWithSecurityHeaders(
      {
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        persistentSessionId: persistentSessionId,
      },
      req,
      API_ENDPOINTS.AMC_AUTHORIZE
    );

    const response = await axios.client.post<SfadAuthorizeResponse>(
      API_ENDPOINTS.AMC_AUTHORIZE,
      {
        journeyType: AMC_JOURNEY_TYPES.SFAD,
      },
      config
    );
    return createApiResponse<SfadAuthorizeResponse>(response);
  };

  return {
    getRedirectUrl,
  };
}
