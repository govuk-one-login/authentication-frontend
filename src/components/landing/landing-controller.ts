import { Request, Response } from "express";
import {
  COOKIE_CONSENT,
  COOKIES_PREFERENCES_SET,
  PATH_NAMES,
  ERROR_LOG_LEVEL,
  API_ERROR_CODES,
} from "../../app.constants";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { BadRequestError } from "../../utils/error";
import { ExpressRouteFunc } from "../../types";
import {
  CookieConsentModel,
  CookieConsentServiceInterface,
} from "../common/cookie-consent/types";
import { cookieConsentService } from "../common/cookie-consent/cookie-consent-service";
import { sanitize } from "../../utils/strings";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { landingService } from "./landing-service";
import { LandingServiceInterface } from "./types";

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
  service: LandingServiceInterface = landingService(),
  cookieService: CookieConsentServiceInterface = cookieConsentService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const { prompt } = req.query;

    const startAuthResponse = await service.start(
      sessionId,
      clientSessionId,
      req.ip,
      persistentSessionId
    );

    if (!startAuthResponse.success) {
      const startError = new BadRequestError(
        startAuthResponse.data.message,
        startAuthResponse.data.code
      );
      if (
        startAuthResponse.data.code &&
        startAuthResponse.data.code ===
          API_ERROR_CODES.SESSION_ID_MISSING_OR_INVALID
      ) {
        startError.level = ERROR_LOG_LEVEL.INFO;
      }
      throw startError;
    }

    req.session.client.serviceType = startAuthResponse.data.client.serviceType;
    req.session.client.name = startAuthResponse.data.client.clientName;
    req.session.client.scopes = startAuthResponse.data.client.scopes;
    req.session.client.cookieConsentEnabled =
      startAuthResponse.data.client.cookieConsentShared;
    req.session.client.consentEnabled =
      startAuthResponse.data.user.consentRequired;

    req.session.user.isIdentityRequired =
      startAuthResponse.data.user.identityRequired;
    req.session.user.isAuthenticated =
      startAuthResponse.data.user.authenticated;

    const nextState = req.session.user.isAuthenticated
      ? USER_JOURNEY_EVENTS.EXISTING_SESSION
      : USER_JOURNEY_EVENTS.LANDING;

    let redirectPath = getNextPathAndUpdateJourney(
      req,
      PATH_NAMES.START,
      nextState,
      {
        isConsentRequired: req.session.client.consentEnabled,
        requiresUplift: startAuthResponse.data.user.upliftRequired,
        isIdentityRequired: req.session.user.isIdentityRequired,
        isAuthenticated: req.session.user.isAuthenticated,
        prompt: sanitize(prompt as string),
      },
      sessionId
    );

    const cookieConsent = sanitize(startAuthResponse.data.user.cookieConsent);

    if (req.session.client.cookieConsentEnabled && cookieConsent) {
      const consentCookieValue =
        cookieService.createConsentCookieValue(cookieConsent);

      createConsentCookie(res, consentCookieValue);

      if (
        startAuthResponse.data.user.gaCrossDomainTrackingId &&
        cookieConsent === COOKIE_CONSENT.ACCEPT
      ) {
        const queryParams = new URLSearchParams({
          _ga: startAuthResponse.data.user.gaCrossDomainTrackingId,
        }).toString();

        redirectPath = redirectPath + "?" + queryParams;
      }
    }

    return res.redirect(redirectPath);
  };
}
