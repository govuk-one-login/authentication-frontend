import { ApiResponseResult, UserSession, UserSessionClient } from "../../types";
import { API_ENDPOINTS } from "../../app.constants";
import {
  createApiResponse,
  getRequestConfig,
  http,
  Http,
} from "../../utils/http";
import { AuthCodeResponse, AuthCodeServiceInterface } from "./types";
import { getApiBaseUrl, getFrontendApiBaseUrl } from "../../config";
import { AxiosResponse } from "axios";

export function authCodeService(axios: Http = http): AuthCodeServiceInterface {
  const getAuthCode = async function (
    sessionId: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string,
    clientSession: UserSessionClient,
    userSession: UserSession
  ): Promise<ApiResponseResult<AuthCodeResponse>> {
    const baseUrl = shouldCallOrchAuthCode(userSession)
      ? getFrontendApiBaseUrl()
      : getApiBaseUrl();
    const config = getRequestConfig({
      baseURL: baseUrl,
      sessionId: sessionId,
      clientSessionId: clientSessionId,
      sourceIp: sourceIp,
      persistentSessionId: persistentSessionId,
    });

    let response: AxiosResponse;

    if (shouldCallOrchAuthCode(userSession)) {
      const body = {
        claims: clientSession.claim,
        state: clientSession.state,
        "redirect-uri": clientSession.redirectUri,
        "rp-sector-uri": clientSession.rpSectorHost,
        "is-new-account": userSession?.isAccountCreationJourney ?? false,
        "password-reset-time": userSession?.passwordResetTime,
      };
      response = await axios.client.post(
        API_ENDPOINTS.ORCH_AUTH_CODE,
        body,
        config
      );
    } else {
      response = await axios.client.get(API_ENDPOINTS.AUTH_CODE, config);
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
