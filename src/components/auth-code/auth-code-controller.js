import { authCodeService } from "./auth-code-service";
import { BadRequestError } from "../../utils/error";
import { cookieConsentService } from "../common/cookie-consent/cookie-consent-service";
import { sanitize } from "../../utils/strings";
import { COOKIE_CONSENT } from "../../app.constants";
export function authCodeGet(service = authCodeService(), cookieService = cookieConsentService()) {
    return async function (req, res) {
        const { sessionId, clientSessionId, persistentSessionId } = res.locals;
        const gaId = req.session.client.crossDomainGaTrackingId;
        const result = await service.getAuthCode(sessionId, clientSessionId, persistentSessionId, req.session.client, req.session.user, req);
        delete req.session.user.reauthenticate;
        if (!result.success) {
            throw new BadRequestError(result.data.message, result.data.code);
        }
        let authCodeLocation = result.data.location;
        if (req.session.client.cookieConsentEnabled) {
            const consentValue = cookieService.getCookieConsent(sanitize(req.cookies.cookies_preferences_set));
            const queryParams = new URLSearchParams({
                cookie_consent: consentValue.cookie_consent,
            });
            if (gaId && consentValue.cookie_consent === COOKIE_CONSENT.ACCEPT) {
                queryParams.append("_ga", gaId);
            }
            authCodeLocation = authCodeLocation + "&" + queryParams.toString();
        }
        res.redirect(authCodeLocation);
    };
}
