import xss from "xss";
import { COOKIE_CONSENT } from "../../../app.constants";
export function cookieConsentService() {
    const getCookieConsent = function (cookieConsentValue) {
        const cookieConsent = xss(cookieConsentValue);
        let consentValue = COOKIE_CONSENT.NOT_ENGAGED;
        if (cookieConsent) {
            const parsedCookie = JSON.parse(cookieConsent);
            consentValue =
                parsedCookie.analytics === true
                    ? COOKIE_CONSENT.ACCEPT
                    : COOKIE_CONSENT.REJECT;
        }
        const cookieValue = {
            cookie_consent: consentValue,
        };
        return cookieValue;
    };
    const createConsentCookieValue = function (cookieConsent) {
        let cookieValue = {};
        const cookieExpires = new Date();
        if ([COOKIE_CONSENT.ACCEPT, COOKIE_CONSENT.REJECT].includes(cookieConsent)) {
            cookieExpires.setFullYear(cookieExpires.getFullYear() + 1);
            cookieValue = {
                analytics: cookieConsent === COOKIE_CONSENT.ACCEPT,
            };
        }
        else {
            cookieExpires.setFullYear(cookieExpires.getFullYear() - 1);
        }
        return { value: JSON.stringify(cookieValue), expires: cookieExpires };
    };
    return {
        getCookieConsent,
        createConsentCookieValue,
    };
}
