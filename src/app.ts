import type { Application } from "express";
import express from "express";
import "express-async-errors";
import cookieParser from "cookie-parser";
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
  getVitalSignsIntervalSeconds,
  supportAccountInterventions,
  supportAuthorizeController,
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
import { checkYourPhoneRouter } from "./components/check-your-phone/check-your-phone-routes.js";
import { landingRouter } from "./components/landing/landing-route.js";
import { ENVIRONMENT_NAME } from "./app.constants.js";
import { enterMfaRouter } from "./components/enter-mfa/enter-mfa-routes.js";
import { howDoYouWantSecurityCodesRouter } from "./components/how-do-you-want-security-codes/how-do-you-want-security-codes-routes.js";
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
import { environmentBannerMiddleware } from "./middleware/environment-banner-middleware.js";
import UID from "uid-safe";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { csrfSynchronisedProtection } from "./utils/csrf.js";
import { csrfMiddleware } from "./middleware/csrf-middleware.js";

const directory_name = dirname(fileURLToPath(import.meta.url));

const APP_VIEWS = [
  path.join(directory_name, "components"),
  path.resolve("node_modules/govuk-frontend/"),
  path.resolve("node_modules/@govuk-one-login/"),
];

function registerRoutes(app: express.Application) {
  app.use(landingRouter);
  app.use(signInOrCreateRouter);
  app.use(enterEmailRouter);
  app.use(accountNotFoundRouter);
  app.use(enterPasswordRouter);
  app.use(resetPasswordCheckEmailRouter);
  app.use(checkYourEmailRouter);
  app.use(createPasswordRouter);
  app.use(selectMFAOptionsRouter);
  app.use(enterAuthenticatorAppCodeRouter);
  app.use(setupAuthenticatorAppRouter);
  app.use(enterPhoneNumberRouter);
  app.use(registerAccountCreatedRouter);
  app.use(footerRouter);
  app.use(checkYourPhoneRouter);
  app.use(changeSecurityCodesConfirmationRouter);
  if (supportAuthorizeController()) {
    app.use(authorizeRouter);
  }
  app.use(securityCodeErrorRouter);
  app.use(enterMfaRouter);
  app.use(howDoYouWantSecurityCodesRouter);
  app.use(authCodeRouter);
  app.use(resendMfaCodeRouter);
  app.use(resendMfaCodeAccountCreationRouter);
  app.use(resendEmailCodeRouter);
  app.use(signedOutRouter);
  app.use(updatedTermsConditionsRouter);
  app.use(resetPasswordRouter);
  app.use(resetPassword2FARouter);
  app.use(resetPassword2FAAuthAppRouter);
  app.use(upliftJourneyRouter);
  app.use(contactUsRouter);
  app.use(proveIdentityCallbackRouter);
  app.use(cookiesRouter);
  app.use(docCheckingAppRouter);
  app.use(docCheckingAppCallbackRouter);
  app.use(errorPageRouter);
  if (supportAccountInterventions()) {
    app.use(accountInterventionRouter);
    app.use(permanentlyBlockedRouter);
    app.use(temporarilyBlockedRouter);
  }
  app.use(mfaResetWithIpvRouter);
  app.use(ipvCallbackRouter);
}

async function createApp(): Promise<express.Application> {
  const app: express.Application = express();
  const isProduction = getNodeEnv() === ENVIRONMENT_NAME.PROD;

  app.enable("trust proxy");

  app.use(loggerMiddleware);
  app.use(healthcheckRouter);
  if (getAppEnv() === "staging") {
    const protect = applyOverloadProtection(isProduction);
    app.use(protect);
  }
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.disable("x-powered-by");

  const staticAssetOptions: serveStatic.ServeStaticOptions<express.Response> = {
    cacheControl: true,
    immutable: false,
    maxAge: "60s",
  };

  app.use(
    "/assets",
    express.static(
      path.resolve("node_modules/govuk-frontend/govuk/assets"),
      staticAssetOptions
    )
  );

  app.use(
    "/public",
    express.static(path.join(directory_name, "public"), staticAssetOptions)
  );
  app.use(noCacheMiddleware);
  app.set("view engine", configureNunjucks(app, APP_VIEWS));
  app.use(setLocalVarsMiddleware);
  app.use(setGTM);

  await i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init(
      i18nextConfigurationOptions(
        path.join(directory_name, "locales/{{lng}}/{{ns}}.json")
      )
    );

  app.use(i18nextMiddleware.handle(i18next));
  app.use(helmet(helmetConfiguration));

  app.use(cookieParser());

  const SESSION_COOKIE_NAME = "aps";
  // Generate a new session ID asynchronously if no session cookie
  // `express-session` does not support async session ID generation
  // https://github.com/expressjs/session/issues/107
  app.use(async (req, res, next) => {
    if (!req.cookies?.[SESSION_COOKIE_NAME]) {
      req.generatedSessionId = await UID(24);
    }
    next();
  });

  app.use(
    session({
      name: SESSION_COOKIE_NAME,
      store: getSessionStore(await getRedisConfig()),
      saveUninitialized: false,
      secret: getSessionSecret(),
      unset: "destroy",
      resave: false,
      cookie: getSessionCookieOptions(
        isProduction,
        getSessionExpiry(),
        getSessionSecret()
      ),
      // Use the newly generated session ID, or fall back to the default behaviour
      genid: (req) => {
        const sessionId = req.generatedSessionId || UID.sync(24);
        delete req.generatedSessionId;
        return sessionId;
      },
    })
  );

  // Must be added to the app after the session and logging, and before the routers.
  app.use(csrfSynchronisedProtection);

  app.use(channelMiddleware);
  app.use(environmentBannerMiddleware);
  app.use(getSessionIdMiddleware);
  app.post("*", sanitizeRequestMiddleware);
  app.use(csrfMiddleware);
  app.use(setHtmlLangMiddleware);
  app.use(initialiseSessionMiddleware);
  app.use(crossDomainTrackingMiddleware);
  app.use(outboundContactUsLinksMiddleware);
  if (getLanguageToggleEnabled()) {
    app.use(setCurrentUrlMiddleware);
  }
  app.use(getAnalyticsPropertiesMiddleware);

  registerRoutes(app);

  app.use(getCookieLanguageMiddleware);
  app.use(pageNotFoundHandler);

  // Error Handlers
  app.use(csrfMissingHandler);
  app.use(logErrorMiddleware);
  app.use(serverErrorHandler);

  return app;
}

async function startServer(app: Application): Promise<{
  server: Server;
  closeServer: (callback?: (err?: Error) => void) => Promise<void>;
}> {
  const port: number | string = process.env.PORT || 3000;
  let server: Server;
  let stopVitalSigns: () => void;

  await new Promise<void>((resolve) => {
    server = app
      .listen(port, () => {
        logger.info(`Server listening on port ${port}`);
        app.emit("appStarted");
        resolve();
      })
      .on("error", (error: Error) => {
        logger.error(`Unable to start server because of ${error.message}`);
      });

    server.keepAliveTimeout = 61 * 1000;
    server.headersTimeout = 91 * 1000;

    stopVitalSigns = frontendVitalSignsInit(server, {
      staticPaths: [/^\/assets\/.*/, /^\/public\/.*/],
      interval: getVitalSignsIntervalSeconds() * 1000,
    });
  });

  const closeServer = async () => {
    await disconnectRedisClient();
    logger.info(`redis client disconnected`);
    if (stopVitalSigns) {
      stopVitalSigns();
      logger.info(`vital-signs stopped`);
    }
    await new Promise<void>((res, rej) =>
      server.close((err) => (err ? rej(err) : res()))
    );
  };

  return { server, closeServer };
}

const shutdownProcess =
  (closeServer: () => Promise<void>) => async (): Promise<void> => {
    try {
      logger.info("closing server");
      await closeServer();
      logger.info("server closed");
      process.exit(0);
    } catch (error) {
      logger.error(`error closing server: ${error.message}`);
      process.exit(1);
    }
  };

export { createApp, startServer, shutdownProcess };
