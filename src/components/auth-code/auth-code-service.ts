import type {
  ApiResponseResult,
  UserSession,
  UserSessionClient,
} from "../../types.js";
import { API_ENDPOINTS } from "../../app.constants.js";
import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import type { AuthCodeResponse, AuthCodeServiceInterface } from "./types.js";
import { supportReauthentication } from "../../config.js";
import type { Request } from "express";

export function authCodeService(axios: Http = http): AuthCodeServiceInterface {
  const getAuthCode = async function (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    clientSession: UserSessionClient,
    userSession: UserSession,
    req: Request
  ): Promise<ApiResponseResult<AuthCodeResponse>> {
    const path = API_ENDPOINTS.ORCH_AUTH_CODE;

    const config = getInternalRequestConfigWithSecurityHeaders(
      {
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        persistentSessionId: persistentSessionId,
      },
      req,
      path
    );

    let body: any = {
      claims: clientSession.claim,
      state: clientSession.state,
      "redirect-uri": clientSession.redirectUri,
      "rp-sector-uri": clientSession.rpSectorHost,
      "is-new-account": userSession?.isAccountCreationJourney ?? false,
      "password-reset-time": userSession?.passwordResetTime,
    };
    if (supportReauthentication() && userSession.reauthenticate) {
      body = { ...body, "is-reauth-journey": true };
    }
    const response = await axios.client.post(path, body, config);

    return createApiResponse<AuthCodeResponse>(response);
  };

  return {
    getAuthCode,
  };
}
