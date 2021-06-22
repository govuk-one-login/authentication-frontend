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
import { footerRouter } from "./components/footer/footer-pages-routes";
import { registerAccountCreatedRouter } from "./components/register-account-created/register_account-created-routes";
import { registerCreatePasswordRouter } from "./components/register-create-password/register-create-password-routes";
import { registerAccountPhoneNumberRouter } from "./components/register-enter-phone-number/register-enter-phone-number-routes";

import * as dotenv from "dotenv";
import { registerVerifyEmailRouter } from "./components/register-verify-email/register-verify-email-routes";
import { pageNotFoundHandler } from "./handlers/page-not-found-handler";
import { serverErrorHandler } from "./handlers/internal-server-error-handler";
dotenv.config();

const APP_VIEWS = [
  path.join(__dirname, "components"),
  path.resolve("node_modules/govuk-frontend/"),
];

const SESSION_COOKIE_OPTIONS = {
  name: "aps",
  keys: [getSessionSecret()],
  maxAge: getSessionExpiry(),
  signed: getNodeEnv() === "production" ? true : false,
  sameSite: true,
};

function registerRoutes(app: express.Application) {
  app.use(enterEmailRouter);
  app.use(enterPasswordRouter);
  app.use(registerVerifyEmailRouter);
  app.use(registerCreatePasswordRouter);
  app.use(registerAccountPhoneNumberRouter);
  app.use(registerAccountCreatedRouter);
  app.use(footerRouter);
}

function createApp(): express.Application {
  const app: express.Application = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use(
    "/assets",
    express.static(path.resolve("node_modules/govuk-frontend/govuk/assets"))
  );

  app.use("/public", express.static(path.join(__dirname, "public")));
  app.set("view engine", configureNunjucks(app, APP_VIEWS));

  app.use(helmet(helmetConfiguration));

  i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init(i18nextConfigurationOptions);

  app.use(i18nextMiddleware.handle(i18next, { removeLngFromUrl: false }));

  app.use(cookieSession(SESSION_COOKIE_OPTIONS));

  app.use(cookieParser());
  app.use(csurf({ cookie: true }));

  app.post("*", sanitizeRequestMiddleware);
  app.use(setHtmlLangMiddleware);

  registerRoutes(app);

  app.use(logErrorMiddleware);
  app.use(serverErrorHandler);
  app.use(pageNotFoundHandler);

  app.locals.logger = new Logger();

  return app;
}

export { createApp };
