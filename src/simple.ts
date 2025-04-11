import type { Application } from "express";
import express from "express";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import type serveStatic from "serve-static";
import { logger, loggerMiddleware } from "./utils/logger.js";
import { sanitizeRequestMiddleware } from "./middleware/sanitize-request-middleware.js";
import * as i18nextMiddleware from "i18next-http-middleware";
import * as path from "path";
import { configureNunjucks } from "./config/nunchucks.js";
import { i18nextConfigurationOptions } from "./config/i18next.js";
import { helmetConfiguration } from "./config/helmet.js";
import helmet from "helmet";

import { setHtmlLangMiddleware } from "./middleware/html-lang-middleware.js";
import i18next from "i18next";
import Backend from "i18next-fs-backend";

import {
  getAppEnv,
  getLanguageToggleEnabled,
  getNodeEnv,
  getSessionExpiry,
  getSessionSecret,
  supportAccountInterventions,
  supportAccountRecovery,
  supportAuthorizeController,
  supportMfaResetWithIpv,
} from "./config.js";
import { logErrorMiddleware } from "./middleware/log-error-middleware.js";
import { getCookieLanguageMiddleware } from "./middleware/cookie-lang-middleware.js";
import { enterEmailRouter } from "./components/enter-email/enter-email-routes.js";
import { enterPasswordRouter } from "./components/enter-password/enter-password-routes.js";
import { footerRouter } from "./components/common/footer/footer-pages-routes.js";
import { registerAccountCreatedRouter } from "./components/account-created/account-created-routes.js";
import { createPasswordRouter } from "./components/create-password/create-password-routes.js";
import { enterPhoneNumberRouter } from "./components/enter-phone-number/enter-phone-number-routes.js";
import { pageNotFoundHandler } from "./handlers/page-not-found-handler.js";
import { serverErrorHandler } from "./handlers/internal-server-error-handler.js";
import { csrfMiddleware } from "./middleware/csrf-middleware.js";
import { checkYourPhoneRouter } from "./components/check-your-phone/check-your-phone-routes.js";
import { landingRouter } from "./components/landing/landing-route.js";
import { getCSRFCookieOptions } from "./config/cookie.js";
import { ENVIRONMENT_NAME } from "./app.constants.js";
import { enterMfaRouter } from "./components/enter-mfa/enter-mfa-routes.js";
import { authCodeRouter } from "./components/auth-code/auth-code-routes.js";
import { resendMfaCodeRouter } from "./components/resend-mfa-code/resend-mfa-code-routes.js";
import { resendMfaCodeAccountCreationRouter } from "./components/account-creation/resend-mfa-code/resend-mfa-code-routes.js";
import { resendEmailCodeRouter } from "./components/resend-email-code/resend-email-code-routes.js";
import { authorizeRouter } from "./components/authorize/authorize-routes.js";
import { signedOutRouter } from "./components/signed-out/signed-out-routes.js";
import {
  getSessionIdMiddleware,
  initialiseSessionMiddleware,
} from "./middleware/session-middleware.js";
import { updatedTermsConditionsRouter } from "./components/updated-terms-conditions/updated-terms-conditions-routes.js";
import { signInOrCreateRouter } from "./components/sign-in-or-create/sign-in-or-create-routes.js";
import { accountNotFoundRouter } from "./components/account-not-found/account-not-found-routes.js";
import { resetPasswordCheckEmailRouter } from "./components/reset-password-check-email/reset-password-check-email-routes.js";
import { setLocalVarsMiddleware } from "./middleware/set-local-vars-middleware.js";
import { resetPasswordRouter } from "./components/reset-password/reset-password-routes.js";
import { resetPassword2FARouter } from "./components/reset-password-2fa-sms/reset-password-2fa-sms-routes.js";
import { noCacheMiddleware } from "./middleware/no-cache-middleware.js";
import { checkYourEmailRouter } from "./components/check-your-email/check-your-email-routes.js";
import { securityCodeErrorRouter } from "./components/security-code-error/security-code-error-routes.js";
import { upliftJourneyRouter } from "./components/uplift-journey/uplift-journey-routes.js";
import { contactUsRouter } from "./components/contact-us/contact-us-routes.js";
import {
  disconnectRedisClient,
  getSessionCookieOptions,
  getSessionStore,
} from "./config/session.js";
import session from "express-session";
import { healthcheckRouter } from "./components/healthcheck/healthcheck-routes.js";
import { crossDomainTrackingMiddleware } from "./middleware/cross-domain-tracking-middleware.js";
import { proveIdentityCallbackRouter } from "./components/prove-identity-callback/prove-identity-callback-routes.js";
import { docCheckingAppRouter } from "./components/doc-checking-app/doc-checking-app-routes.js";
import { docCheckingAppCallbackRouter } from "./components/doc-checking-app-callback/doc-checking-app-callback-routes.js";
import { selectMFAOptionsRouter } from "./components/select-mfa-options/select-mfa-options-routes.js";
import { setupAuthenticatorAppRouter } from "./components/setup-authenticator-app/setup-authenticator-app-routes.js";
import { enterAuthenticatorAppCodeRouter } from "./components/enter-authenticator-app-code/enter-authenticator-app-code-routes.js";
import { cookiesRouter } from "./components/common/cookies/cookies-routes.js";
import { errorPageRouter } from "./components/common/errors/error-routes.js";
import { checkYourEmailSecurityCodesRouter } from "./components/account-recovery/check-your-email-security-codes/check-your-email-security-codes-routes.js";
import { changeSecurityCodesConfirmationRouter } from "./components/account-recovery/change-security-codes-confirmation/change-security-codes-confirmation-routes.js";
import { outboundContactUsLinksMiddleware } from "./middleware/outbound-contact-us-links-middleware.js";
import { accountInterventionRouter } from "./components/account-intervention/password-reset-required/password-reset-required-router.js";
import { permanentlyBlockedRouter } from "./components/account-intervention/permanently-blocked/permanently-blocked-router.js";
import { temporarilyBlockedRouter } from "./components/account-intervention/temporarily-blocked/temporarily-blocked-router.js";
import { resetPassword2FAAuthAppRouter } from "./components/reset-password-2fa-auth-app/reset-password-2fa-auth-app-routes.js";
import { setGTM } from "./middleware/analytics-middleware.js";
import { setCurrentUrlMiddleware } from "./middleware/current-url-middleware.js";
import { getRedisConfig } from "./utils/redis.js";
import { csrfMissingHandler } from "./handlers/csrf-missing-handler.js";
import { channelMiddleware } from "./middleware/channel-middleware.js";
import { applyOverloadProtection } from "./middleware/overload-protection-middleware.js";
import { frontendVitalSignsInit } from "@govuk-one-login/frontend-vital-signs";
import type { Server } from "node:http";
import { getAnalyticsPropertiesMiddleware } from "./middleware/get-analytics-properties-middleware.js";
import { ipvCallbackRouter } from "./components/ipv-callback/ipv-callback-routes.js";
import { mfaResetWithIpvRouter } from "./components/mfa-reset-with-ipv/mfa-reset-with-ipv-routes.js";
import { asyncHandler } from "./utils/async.js";
import { environmentBannerMiddleware } from "./middleware/environment-banner-middleware.js";
import UID from "uid-safe";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

export async function blah(): Promise<boolean> {
  return Promise.resolve(true);
}
