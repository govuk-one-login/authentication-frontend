import express from "express";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import { loggerMiddleware } from "./utils/logger";

import { sanitizeRequestMiddleware } from "./middleware/sanitize-request-middleware";
import i18nextMiddleware from "i18next-http-middleware";
import * as path from "path";
import { configureNunjucks } from "./config/nunchucks";
import { i18nextConfigurationOptions } from "./config/i18next";
import { helmetConfiguration } from "./config/helmet";
import helmet from "helmet";

import { setHtmlLangMiddleware } from "./middleware/html-lang-middleware";
import i18next from "i18next";
import Backend from "i18next-fs-backend";

import {
  getAppEnv,
  getNodeEnv,
  getRedisConfig,
  getRedisHost,
  getRedisPort,
  getSessionExpiry,
  getSessionSecret,
  supportMFAOptions,
} from "./config";
import { logErrorMiddleware } from "./middleware/log-error-middleware";
import { enterEmailRouter } from "./components/enter-email/enter-email-routes";
import { enterPasswordRouter } from "./components/enter-password/enter-password-routes";
import { footerRouter } from "./components/common/footer/footer-pages-routes";
import { registerAccountCreatedRouter } from "./components/account-created/account-created-routes";
import { createPasswordRouter } from "./components/create-password/create-password-routes";
import { enterPhoneNumberRouter } from "./components/enter-phone-number/enter-phone-number-routes";

import { pageNotFoundHandler } from "./handlers/page-not-found-handler";
import { serverErrorHandler } from "./handlers/internal-server-error-handler";
import { csrfMiddleware } from "./middleware/csrf-middleware";
import { checkYourPhoneRouter } from "./components/check-your-phone/check-your-phone-routes";
import { landingRouter } from "./components/landing/landing-route";
import { getCSRFCookieOptions } from "./config/cookie";
import { APP_ENV_NAME, ENVIRONMENT_NAME } from "./app.constants";
import { enterMfaRouter } from "./components/enter-mfa/enter-mfa-routes";
import { authCodeRouter } from "./components/auth-code/auth-code-routes";
import { resendMfaCodeRouter } from "./components/resend-mfa-code/resend-mfa-code-routes";
import { signedOutRouter } from "./components/signed-out/signed-out-routes";
import {
  getSessionIdMiddleware,
  initialiseSessionMiddleware,
} from "./middleware/session-middleware";
import { shareInfoRouter } from "./components/share-info/share-info-routes";
import { updatedTermsConditionsRouter } from "./components/updated-terms-conditions/updated-terms-conditions-routes";
import { signInOrCreateRouter } from "./components/sign-in-or-create/sign-in-or-create-routes";
import { accountNotFoundRouter } from "./components/account-not-found/account-not-found-routes";
import { resetPasswordCheckEmailRouter } from "./components/reset-password-check-email/reset-password-check-email-routes";
import { setLocalVarsMiddleware } from "./middleware/set-local-vars-middleware";
import { resetPasswordRouter } from "./components/reset-password/reset-password-routes";
import { noCacheMiddleware } from "./middleware/no-cache-middleware";
import { checkYourEmailRouter } from "./components/check-your-email/check-your-email-routes";
import { securityCodeErrorRouter } from "./components/security-code-error/security-code-error-routes";
import { upliftJourneyRouter } from "./components/uplift-journey/uplift-journey-routes";
import { contactUsRouter } from "./components/contact-us/contact-us-routes";
import { getSessionCookieOptions, getSessionStore } from "./config/session";
import session from "express-session";
import { proveIdentityRouter } from "./components/prove-identity/prove-identity-routes";
import { healthcheckRouter } from "./components/healthcheck/healthcheck-routes";
import { crossDomainTrackingMiddleware } from "./middleware/cross-domain-tracking-middleware";
import { proveIdentityWelcomeRouter } from "./components/prove-identity-welcome/prove-identity-welcome-routes";
import { proveIdentityCallbackRouter } from "./components/prove-identity-callback/prove-identity-callback-routes";
import { docCheckingAppRouter } from "./components/doc-checking-app/doc-checking-app-routes";
import { docCheckingAppCallbackRouter } from "./components/doc-checking-app-callback/doc-checking-app-callback-routes";
import { selectMFAOptionsRouter } from "./components/select-mfa-options/select-mfa-options-routes";
import { setupAuthenticatorAppRouter } from "./components/setup-authenticator-app/setup-authenticator-app-routes";

const APP_VIEWS = [
  path.join(__dirname, "components"),
  path.resolve("node_modules/govuk-frontend/"),
];

function registerRoutes(app: express.Application, appEnvIsProduction: boolean) {
  app.use(landingRouter);
  app.use(signInOrCreateRouter);
  app.use(enterEmailRouter);
  app.use(accountNotFoundRouter);
  app.use(enterPasswordRouter);
  app.use(resetPasswordCheckEmailRouter);
  app.use(checkYourEmailRouter);
  app.use(createPasswordRouter);
  if (supportMFAOptions()) {
    app.use(selectMFAOptionsRouter);
  }
  app.use(enterPhoneNumberRouter);
  app.use(registerAccountCreatedRouter);
  app.use(footerRouter);
  app.use(checkYourPhoneRouter);
  app.use(securityCodeErrorRouter);
  app.use(enterMfaRouter);
  app.use(authCodeRouter);
  app.use(resendMfaCodeRouter);
  app.use(signedOutRouter);
  app.use(shareInfoRouter);
  app.use(updatedTermsConditionsRouter);
  app.use(resetPasswordRouter);
  app.use(upliftJourneyRouter);
  app.use(contactUsRouter);
  app.use(healthcheckRouter);
  if (!appEnvIsProduction) {
    app.use(proveIdentityRouter);
    app.use(proveIdentityWelcomeRouter);
    app.use(proveIdentityCallbackRouter);
    app.use(docCheckingAppRouter);
    app.use(docCheckingAppCallbackRouter);
  }
  app.use(setupAuthenticatorAppRouter);
}

async function createApp(): Promise<express.Application> {
  const app: express.Application = express();
  const isProduction = getNodeEnv() === ENVIRONMENT_NAME.PROD;
  const appEnvIsProduction = getAppEnv() === APP_ENV_NAME.PROD;

  app.enable("trust proxy");

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(noCacheMiddleware);
  app.use(loggerMiddleware);

  app.use(
    "/assets",
    express.static(path.resolve("node_modules/govuk-frontend/govuk/assets"))
  );

  app.use("/public", express.static(path.join(__dirname, "public")));
  app.set("view engine", configureNunjucks(app, APP_VIEWS));
  app.use(setLocalVarsMiddleware);

  i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init(
      i18nextConfigurationOptions(
        path.join(__dirname, "locales/{{lng}}/{{ns}}.json")
      )
    );

  app.use(i18nextMiddleware.handle(i18next));
  app.use(helmet(helmetConfiguration));

  const redisConfig = isProduction
    ? await getRedisConfig(getAppEnv())
    : { host: getRedisHost(), port: getRedisPort(), isLocal: true };

  app.use(
    session({
      name: "aps",
      store: getSessionStore(redisConfig),
      saveUninitialized: false,
      secret: getSessionSecret(),
      unset: "destroy",
      resave: false,
      cookie: getSessionCookieOptions(
        isProduction,
        getSessionExpiry(),
        getSessionSecret()
      ),
    })
  );

  app.use(cookieParser());
  app.use(csurf({ cookie: getCSRFCookieOptions(isProduction) }));

  app.use(getSessionIdMiddleware);
  app.post("*", sanitizeRequestMiddleware);
  app.use(csrfMiddleware);
  app.use(setHtmlLangMiddleware);
  app.use(initialiseSessionMiddleware);
  app.use(crossDomainTrackingMiddleware);

  registerRoutes(app, appEnvIsProduction);

  app.use(logErrorMiddleware);
  app.use(serverErrorHandler);
  app.use(pageNotFoundHandler);

  return app;
}

export { createApp };
