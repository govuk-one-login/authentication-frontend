import type { MfaResetAuthorizeInterface, MfaResetAuthorizeResponse } from "./types.js";
import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import type { ApiResponseResult } from "../../types.js";
import { API_ENDPOINTS } from "../../app.constants.js";
import type { Request } from "express";

export function mfaResetAuthorizeService(axios: Http = http): MfaResetAuthorizeInterface {
  const ipvRedirectUrl = async function (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    email: string,
    orchestrationRedirectUrl: string
  ): Promise<ApiResponseResult<MfaResetAuthorizeResponse>> {
    const config = getInternalRequestConfigWithSecurityHeaders(
      {
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        persistentSessionId: persistentSessionId,
      },
      req,
      API_ENDPOINTS.MFA_RESET_AUTHORIZE
    );

    const response = await axios.client.post<MfaResetAuthorizeResponse>(
      API_ENDPOINTS.MFA_RESET_AUTHORIZE,
      {
        email,
        orchestrationRedirectUrl,
      },
      config
    );
    return createApiResponse<MfaResetAuthorizeResponse>(response);
  };

  return {
    ipvRedirectUrl: ipvRedirectUrl,
  };
}
