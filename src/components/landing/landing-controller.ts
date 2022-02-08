import { Request, Response } from "express";
import {
  COOKIE_CONSENT,
  COOKIES_PREFERENCES_SET,
  PATH_NAMES,
} from "../../app.constants";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { BadRequestError } from "../../utils/error";
import { ClientInfoServiceInterface } from "../common/client-info/types";
import { clientInfoService } from "../common/client-info/client-info-service";
import { ExpressRouteFunc } from "../../types";
import {
  CookieConsentModel,
  CookieConsentServiceInterface,
} from "../common/cookie-consent/types";
import { cookieConsentService } from "../common/cookie-consent/cookie-consent-service";
import { sanitize } from "../../utils/strings";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";

function createConsentCookie(
  res: Response,
  consentCookieValue: CookieConsentModel
) {
  res.cookie(COOKIES_PREFERENCES_SET, consentCookieValue.value, {
    expires: consentCookieValue.expiry,
    secure: true,
    domain: res.locals.analyticsCookieDomain,
  });
}

export function landingGet(
  service: ClientInfoServiceInterface = clientInfoService(),
  cookieService: CookieConsentServiceInterface = cookieConsentService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const { uplift, identity, consent, _ga, cookie_consent } = req.query;
    const ga = sanitize(_ga as string);

    const clientInfoResponse = await service.clientInfo(
      sessionId,
      clientSessionId,
      req.ip,
      persistentSessionId
    );

    if (!clientInfoResponse.success) {
      throw new BadRequestError(
        clientInfoResponse.data.message,
        clientInfoResponse.data.code
      );
    }

    req.session.client.serviceType = clientInfoResponse.data.serviceType;
    req.session.client.name = clientInfoResponse.data.clientName;
    req.session.client.cookieConsentEnabled =
      clientInfoResponse.data.cookieConsentShared;
    req.session.client.consentEnabled = clientInfoResponse.data.consentEnabled;

    req.session.user.isIdentityRequired = identity === "true";

    const nextState = req.session.user.isAuthenticated
      ? USER_JOURNEY_EVENTS.EXISTING_SESSION
      : USER_JOURNEY_EVENTS.LANDING;

    let redirectPath = getNextPathAndUpdateJourney(
      req,
      PATH_NAMES.START,
      nextState,
      {
        isConsentRequired:
          consent === "true" && req.session.user.isAuthenticated,
        requiresUplift: uplift === "true" && req.session.user.isAuthenticated,
        isIdentityRequired:
          identity === "true" && req.session.user.isAuthenticated, //TOOD double check
        isAuthenticated: req.session.user.isAuthenticated,
      },
      sessionId
    );

    const cookieConsent = sanitize(cookie_consent as string);

    if (req.session.client.cookieConsentEnabled && cookieConsent) {
      const consentCookieValue =
        cookieService.createConsentCookieValue(cookieConsent);

      createConsentCookie(res, consentCookieValue);

      if (ga && cookieConsent === COOKIE_CONSENT.ACCEPT) {
        const queryParams = new URLSearchParams({
          _ga: ga,
        }).toString();

        redirectPath = redirectPath + "?" + queryParams;
      }
    }

    return res.redirect(redirectPath);
  };
}
