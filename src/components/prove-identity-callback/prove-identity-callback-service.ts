import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import { API_ENDPOINTS, COOKIE_CONSENT } from "../../app.constants.js";
import type { ApiResponseResult } from "../../types.js";
import type {
  ProcessIdentityResponse,
  ProveIdentityCallbackServiceInterface,
} from "./types.js";
import type { Request, Response } from "express";
import { getApiBaseUrl } from "../../config.js";
import type { AuthCodeResponse } from "../auth-code/types.js";
import { ApiError } from "../../utils/error.js";
import { sanitize } from "../../utils/strings.js";
import type { CookieConsentServiceInterface } from "../common/cookie-consent/types.js";
import { cookieConsentService } from "../common/cookie-consent/cookie-consent-service.js";
export function proveIdentityCallbackService(
  axios: Http = http,
  cookieService: CookieConsentServiceInterface = cookieConsentService()
): ProveIdentityCallbackServiceInterface {
  const identityProcessed = async function (
    email: string,
    req: Request,
    res: Response
  ): Promise<ApiResponseResult<ProcessIdentityResponse>> {
    const response = await axios.client.post<ProcessIdentityResponse>(
      API_ENDPOINTS.IPV_PROCESSING_IDENTITY,
      { email: email },
      getInternalRequestConfigWithSecurityHeaders(
        req,
        res,
        API_ENDPOINTS.IPV_PROCESSING_IDENTITY
      )
    );

    return createApiResponse<ProcessIdentityResponse>(response);
  };
  const generateSuccessfulRpReturnUrl = async function (
    req: Request,
    res: Response
  ): Promise<string> {
    const config = getInternalRequestConfigWithSecurityHeaders(
      req,
      res,
      API_ENDPOINTS.AUTH_CODE,
      {
        baseURL: getApiBaseUrl(),
      }
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
