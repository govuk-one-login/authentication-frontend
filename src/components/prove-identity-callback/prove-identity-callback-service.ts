import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS, COOKIE_CONSENT } from "../../app.constants";
import { ApiResponseResult } from "../../types";
import {
  ProcessIdentityResponse,
  ProveIdentityCallbackServiceInterface,
} from "./types";
import { Request } from "express";
import { getApiBaseUrl } from "../../config";
import { AuthCodeResponse } from "../auth-code/types";
import { ApiError } from "../../utils/error";
import { sanitize } from "../../utils/strings";
import { CookieConsentServiceInterface } from "../common/cookie-consent/types";
import { cookieConsentService } from "../common/cookie-consent/cookie-consent-service";

export function proveIdentityCallbackService(
  axios: Http = http,
  cookieService: CookieConsentServiceInterface = cookieConsentService()
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
  const generateSuccessfulRpReturnUrl = async function (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ): Promise<string> {
    const config = getInternalRequestConfigWithSecurityHeaders(
      {
        baseURL: getApiBaseUrl(),
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        persistentSessionId: persistentSessionId,
      },
      req,
      API_ENDPOINTS.AUTH_CODE
    );
    const response = await axios.client.get(API_ENDPOINTS.AUTH_CODE, config);
    const result = createApiResponse<AuthCodeResponse>(response);

    if (!result.success) {
      throw new ApiError(result.data.message, result.data.code);
    }

    let authCodeLocation = result.data.location;

    if (req.session.client.cookieConsentEnabled) {
      const consentValue = cookieService.getCookieConsent(
        sanitize(req.cookies.cookies_preferences_set)
      );

      const queryParams = new URLSearchParams({
        cookie_consent: consentValue.cookie_consent,
      });

      const gaId = req.session.client.crossDomainGaTrackingId;
      if (gaId && consentValue.cookie_consent === COOKIE_CONSENT.ACCEPT) {
        queryParams.append("_ga", gaId);
      }

      authCodeLocation = authCodeLocation + "&" + queryParams.toString();
    }
    return authCodeLocation;
  };

  return {
    processIdentity: identityProcessed,
    generateSuccessfulRpReturnUrl,
  };
}
