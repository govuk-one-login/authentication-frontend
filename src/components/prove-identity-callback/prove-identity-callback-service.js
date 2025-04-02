import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../utils/http";
import { API_ENDPOINTS, COOKIE_CONSENT } from "../../app.constants";
import { getApiBaseUrl } from "../../config";
import { ApiError } from "../../utils/error";
import { sanitize } from "../../utils/strings";
import { cookieConsentService } from "../common/cookie-consent/cookie-consent-service";
export function proveIdentityCallbackService(axios = http, cookieService = cookieConsentService()) {
    const identityProcessed = async function (email, sessionId, clientSessionId, persistentSessionId, req) {
        const response = await axios.client.post(API_ENDPOINTS.IPV_PROCESSING_IDENTITY, { email: email }, getInternalRequestConfigWithSecurityHeaders({
            sessionId: sessionId,
            clientSessionId: clientSessionId,
            persistentSessionId: persistentSessionId,
        }, req, API_ENDPOINTS.IPV_PROCESSING_IDENTITY));
        return createApiResponse(response);
    };
    const generateSuccessfulRpReturnUrl = async function (sessionId, clientSessionId, persistentSessionId, req) {
        const config = getInternalRequestConfigWithSecurityHeaders({
            baseURL: getApiBaseUrl(),
            sessionId: sessionId,
            clientSessionId: clientSessionId,
            persistentSessionId: persistentSessionId,
        }, req, API_ENDPOINTS.AUTH_CODE);
        const response = await axios.client.get(API_ENDPOINTS.AUTH_CODE, config);
        const result = createApiResponse(response);
        if (!result.success) {
            throw new ApiError(result.data.message, result.data.code);
        }
        let authCodeLocation = result.data.location;
        if (req.session.client.cookieConsentEnabled) {
            const consentValue = cookieService.getCookieConsent(sanitize(req.cookies.cookies_preferences_set));
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
