import { Request, Response } from "express";
import {
  COOKIE_CONSENT,
  COOKIES_PREFERENCES_SET,
  PATH_NAMES,
  ERROR_LOG_LEVEL,
} from "../../app.constants";
import { getNextPathAndUpdateJourney, ERROR_CODES } from "../common/constants";
import { BadRequestError, QueryParamsError } from "../../utils/error";
import { ApiResponseResult, ExpressRouteFunc } from "../../types";
import { CookieConsentServiceInterface } from "../common/cookie-consent/types";
import { cookieConsentService } from "../common/cookie-consent/cookie-consent-service";
import { sanitize } from "../../utils/strings";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { authorizeService } from "./authorize-service";
import {
  AuthorizeServiceInterface,
  KmsDecryptionServiceInterface,
  JwtServiceInterface,
  StartAuthResponse,
} from "./types";
import { KmsDecryptionService } from "./kms-decryption-service";
import { JwtService } from "./jwt-service";
import { appendQueryParamIfHasValue } from "../../utils/url";
import {
  getOrchToAuthExpectedClientId,
  supportReauthentication,
  proveIdentityWelcomeEnabled,
} from "../../config";
import { logger } from "../../utils/logger";
import { Claims } from "./claims-config";

export function authorizeGet(
  authService: AuthorizeServiceInterface = authorizeService(),
  cookiesConsentService: CookieConsentServiceInterface = cookieConsentService(),
  kmsService: KmsDecryptionServiceInterface = new KmsDecryptionService(),
  jwtService: JwtServiceInterface = new JwtService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const loginPrompt = sanitize(req.query.prompt as string);

    const clientId = req.query.client_id as string;
    const responseType = req.query.response_type as string;
    let claims: Claims;
    try {
      validateQueryParams(clientId, responseType);

      const encryptedAuthRequestJWE = req.query.request as string;
      const authRequestJweDecryptedAsJwt = await kmsService.decrypt(
        encryptedAuthRequestJWE
      );
      claims = await jwtService.getPayloadWithValidation(
        authRequestJweDecryptedAsJwt
      );
    } catch (error) {
      throw new BadRequestError(error.message);
    }

    const startAuthResponse = await authService.start(
      sessionId,
      clientSessionId,
      persistentSessionId,
      req,
      claims.reauthenticate,
      claims.previous_session_id
    );

    if (!startAuthResponse.success) {
      const startError = new BadRequestError(
        startAuthResponse.data.message,
        startAuthResponse.data.code
      );
      if (
        startAuthResponse.data.code &&
        startAuthResponse.data.code ===
          ERROR_CODES.SESSION_ID_MISSING_OR_INVALID
      ) {
        startError.level = ERROR_LOG_LEVEL.INFO;
      }
      throw startError;
    }

    req.session.client.prompt = loginPrompt;
    setSessionDataFromClaims(req, claims);
    setSessionDataFromAuthResponse(req, startAuthResponse);

    if (
      supportReauthentication() &&
      req.session.user.reauthenticate &&
      startAuthResponse.data.user.isBlockedForReauth
    ) {
      logger.info(
        `Start response indicates user with session ${res.locals.sessionId} is blocked for reauth, redirecting back to orchestration`
      );
      return res.redirect(
        req.session.client.redirectUri.concat("?error=login_required")
      );
    }

    req.session.user.isAccountCreationJourney = undefined;

    logger.info(`Reauth claim length ${claims.reauthenticate?.length}`);
    logger.info(`Support for reauth is enabled ${supportReauthentication()}`);

    const nextStateEvent = req.session.user.isAuthenticated
      ? USER_JOURNEY_EVENTS.EXISTING_SESSION
      : USER_JOURNEY_EVENTS.NO_EXISTING_SESSION;

    let redirectPath = await getNextPathAndUpdateJourney(
      req,
      PATH_NAMES.AUTHORIZE,
      nextStateEvent,
      {
        requiresUplift: req.session.user.isUpliftRequired,
        isIdentityRequired: req.session.user.isIdentityRequired,
        isAuthenticated: req.session.user.isAuthenticated,
        prompt: req.session.client.prompt,
        skipAuthentication: req.session.user.docCheckingAppUser,
        mfaMethodType: startAuthResponse.data.user.mfaMethodType,
        isReauthenticationRequired: req.session.user.reauthenticate,
        proveIdentityWelcomeEnabled: proveIdentityWelcomeEnabled(),
      },
      sessionId
    );

    const cookieConsent = sanitize(startAuthResponse.data.user.cookieConsent);

    if (req.session.client.cookieConsentEnabled && cookieConsent) {
      const consentCookieValue =
        cookiesConsentService.createConsentCookieValue(cookieConsent);

      res.cookie(COOKIES_PREFERENCES_SET, consentCookieValue.value, {
        expires: consentCookieValue.expires,
        secure: true,
        httpOnly: false,
        domain: res.locals.analyticsCookieDomain,
        encode: String,
      });

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

    const faceToFaceRpGoogleAnalyticsParamKey = "result";
    const faceToFaceRpGoogleAnalyticsParamValue = sanitize(
      req.query[faceToFaceRpGoogleAnalyticsParamKey] as string
    );

    return res.redirect(
      appendQueryParamIfHasValue(
        redirectPath,
        faceToFaceRpGoogleAnalyticsParamKey,
        faceToFaceRpGoogleAnalyticsParamValue
      )
    );
  };
}

function setSessionDataFromClaims(req: Request, claims: Claims) {
  if (claims.claim !== undefined) {
    const claim = JSON.parse(claims.claim);
    if (claim.userinfo !== undefined) {
      req.session.client.claim = Object.keys(claim.userinfo);
    }
  }

  req.session.client.serviceType = claims.service_type;
  req.session.client.name = claims.client_name;
  req.session.client.cookieConsentEnabled = claims.cookie_consent_shared;
  req.session.client.redirectUri = claims.redirect_uri;
  req.session.client.state = claims.state;
  req.session.client.isOneLoginService = claims.is_one_login_service;
  req.session.client.rpSectorHost = claims.rp_sector_host;
  req.session.client.rpRedirectUri = claims.rp_redirect_uri;
  req.session.client.rpState = claims.rp_state;
  req.session.user.reauthenticate = supportReauthentication()
    ? claims.reauthenticate
    : null;
}

function setSessionDataFromAuthResponse(
  req: Request,
  startAuthResponse: ApiResponseResult<StartAuthResponse>
) {
  req.session.user.isIdentityRequired =
    startAuthResponse.data.user.identityRequired;
  req.session.user.isAuthenticated = startAuthResponse.data.user.authenticated;
  req.session.user.isUpliftRequired =
    startAuthResponse.data.user.upliftRequired;
  req.session.user.docCheckingAppUser =
    startAuthResponse.data.user.docCheckingAppUser;
  if (startAuthResponse.data.featureFlags) {
    req.session.user.featureFlags = startAuthResponse.data.featureFlags;
  }
}

function validateQueryParams(clientId: string, responseType: string) {
  if (responseType == null) {
    throw new QueryParamsError("Response type is not set");
  }

  if (clientId !== getOrchToAuthExpectedClientId()) {
    throw new QueryParamsError("Client ID value is incorrect");
  }
}
