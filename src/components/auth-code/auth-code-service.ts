import { ApiResponseResult, UserSession, UserSessionClient } from "../../types";
import { API_ENDPOINTS } from "../../app.constants";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
  Http,
} from "../../utils/http";
import { AuthCodeResponse, AuthCodeServiceInterface } from "./types";
import { supportReauthentication } from "../../config";
import { Request } from "express";

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
