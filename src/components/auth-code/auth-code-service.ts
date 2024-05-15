import { ApiResponseResult, UserSession, UserSessionClient } from "../../types";
import { API_ENDPOINTS } from "../../app.constants";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
  Http,
} from "../../utils/http";
import { AuthCodeResponse, AuthCodeServiceInterface } from "./types";
import { getApiBaseUrl, getFrontendApiBaseUrl } from "../../config";
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
      const body = {
        claims: clientSession.claim,
        state: clientSession.state,
        "redirect-uri": clientSession.redirectUri,
        "rp-sector-uri": clientSession.rpSectorHost,
        "is-new-account": userSession?.isAccountCreationJourney ?? false,
        "password-reset-time": userSession?.passwordResetTime,
      };
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
