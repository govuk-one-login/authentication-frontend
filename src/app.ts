import express from "express";
import { router } from "./routes";
import cookieParser from "cookie-parser";
import csurf from "csurf";

import { pageNotFoundHandler, serverErrorHandler } from "./error-handler";

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

import * as dotenv from "dotenv";
dotenv.config();

import cookieSession from "cookie-session";
import {getNodeEnv, getSessionExpiry, getSessionSecret} from "./config";

const APP_VIEWS = [
  path.join(__dirname, "/views"),
  path.resolve("node_modules/govuk-frontend/"),
];

const SESSION_COOKIE_OPTIONS = {
  name: "session",
  keys: [getSessionSecret()],
  maxAge: getSessionExpiry(),
  signed: getNodeEnv() === 'production' ? true : false,
  sameSite: true,
};

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

  app.use(router);

  app.use(pageNotFoundHandler);
  app.use(serverErrorHandler);

  app.locals.logger = new Logger();

  return app;
}

export { createApp };
