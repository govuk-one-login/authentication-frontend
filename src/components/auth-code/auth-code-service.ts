import { ApiResponseResult, UserSession, UserSessionClient } from "../../types.js";
import { API_ENDPOINTS } from "../../app.constants.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
  Http,
} from "../../utils/http.js";
import { AuthCodeResponse, AuthCodeServiceInterface } from "./types.js";
import {
  getApiBaseUrl,
  getFrontendApiBaseUrl,
  supportReauthentication,
} from "../../config.js";
import { AxiosResponse } from "axios";
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
    const useOrchAuthCode = shouldCallOrchAuthCode(userSession);
    const baseUrl = useOrchAuthCode ? getFrontendApiBaseUrl() : getApiBaseUrl();
    const path = useOrchAuthCode
      ? API_ENDPOINTS.ORCH_AUTH_CODE
      : API_ENDPOINTS.AUTH_CODE;

    const config = getInternalRequestConfigWithSecurityHeaders(
      {
        baseURL: baseUrl,
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        persistentSessionId: persistentSessionId,
      },
      req,
      path
    );

    let response: AxiosResponse;

    if (useOrchAuthCode) {
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
      response = await axios.client.post(path, body, config);
    } else {
      response = await axios.client.get(path, config);
    }

    return createApiResponse<AuthCodeResponse>(response);
  };

  function shouldCallOrchAuthCode(userSession: UserSession) {
    return !userSession.authCodeReturnToRP;
  }

  return {
    getAuthCode,
  };
}
