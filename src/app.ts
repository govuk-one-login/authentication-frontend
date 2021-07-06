import express from "express";
import cookieParser from "cookie-parser";
import csurf from "csurf";

import { sanitizeRequestMiddleware } from "./middleware/sanitize-request-middleware";
import i18nextMiddleware from "i18next-http-middleware";
import * as path from "path";
import bodyParser from "body-parser";
import { configureNunjucks } from "./config/nunchucks";
import { i18nextConfigurationOptions } from "./config/i18next";
import Logger from "./utils/logger";
import { helmetConfiguration } from "./config/helmet";
import helmet from "helmet";

import { setHtmlLangMiddleware } from "./middleware/html-lang-middleware";
import i18next from "i18next";
import Backend from "i18next-fs-backend";

import cookieSession from "cookie-session";
import { getNodeEnv, getSessionExpiry, getSessionSecret } from "./config";
import { logErrorMiddleware } from "./middleware/log-error-middleware";
import { enterEmailRouter } from "./components/enter-email/enter-email-routes";
import { enterPasswordRouter } from "./components/enter-password/enter-password-routes";
import { footerRouter } from "./components/common/footer/footer-pages-routes";
import { registerAccountCreatedRouter } from "./components/account-created/account-created-routes";
import { createPasswordRouter } from "./components/create-password/create-password-routes";
import { enterPhoneNumberRouter } from "./components/enter-phone-number/enter-phone-number-routes";

import * as dotenv from "dotenv";
import { verifyEmailRouter } from "./components/verify-email/verify-email-routes";
import { pageNotFoundHandler } from "./handlers/page-not-found-handler";
import { serverErrorHandler } from "./handlers/internal-server-error-handler";
import { csrfMiddleware } from "./middleware/csrf-middleware";
import { checkYourPhoneRouter } from "./components/check-your-phone/check-your-phone-routes";
import { landingRouter } from "./components/landing/landing-route";
import { getCSRFCookieOptions, getSessionCookieOptions } from "./config/cookie";
import { ENVIRONMENT_NAME } from "./app.constants";
import { cookiesRouter } from "./components/common/cookies/cookies-routes";

dotenv.config();

const APP_VIEWS = [
  path.join(__dirname, "components"),
  path.resolve("node_modules/govuk-frontend/"),
];

function registerRoutes(app: express.Application) {
  app.use(landingRouter);
  app.use(enterEmailRouter);
  app.use(enterPasswordRouter);
  app.use(verifyEmailRouter);
  app.use(createPasswordRouter);
  app.use(enterPhoneNumberRouter);
  app.use(registerAccountCreatedRouter);
  app.use(footerRouter);
  app.use(cookiesRouter);
  app.use(checkYourPhoneRouter);
}

function createApp(): express.Application {
  const app: express.Application = express();
  const isProduction = getNodeEnv() === ENVIRONMENT_NAME.PROD;

  app.enable("trust proxy");

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use(
    "/assets",
    express.static(path.resolve("node_modules/govuk-frontend/govuk/assets"))
  );

  app.use("/public", express.static(path.join(__dirname, "public")));
  app.set("view engine", configureNunjucks(app, APP_VIEWS));

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

  app.use(
    cookieSession(
      getSessionCookieOptions(
        isProduction,
        getSessionExpiry(),
        getSessionSecret()
      )
    )
  );
  app.use(cookieParser());
  app.use(csurf({ cookie: getCSRFCookieOptions(isProduction) }));

  app.post("*", sanitizeRequestMiddleware);
  app.use(csrfMiddleware);
  app.use(setHtmlLangMiddleware);

  registerRoutes(app);

  app.use(logErrorMiddleware);
  app.use(serverErrorHandler);
  app.use(pageNotFoundHandler);

  app.locals.logger = new Logger();

  return app;
}

export { createApp };
