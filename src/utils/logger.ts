import { pino } from "pino";
import { pinoHttp } from "pino-http";
import { getLogLevel } from "../config.js";
import type { Request, Response } from "express";

const logger = pino({
  name: "di-auth",
  level: getLogLevel(),
  serializers: {
    req: (req: Request) => {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        from: getRefererFrom(req.headers.referer),
        headers: req.headers,
      };
    },
    res: (res: Response) => {
      return {
        status: res.statusCode,
        sessionId: res.locals.sessionId,
        clientSessionId: res.locals.clientSessionId,
        persistentSessionId: res.locals.persistentSessionId,
        languageFromCookie: res.locals.language?.toUpperCase(),
        clientId: res.locals.clientId,
      };
    },
  },
});

export function getRefererFrom(referer: string): string {
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return refererUrl.pathname;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return undefined;
    }
  } else {
    return undefined;
  }
}

const loggerMiddleware = pinoHttp({
  logger,
  wrapSerializers: false,
  autoLogging: {
    ignore: (req) =>
      [
        "/public/scripts/analytics.js",
        "/public/scripts/dataLayerEvents.js",
        "/public/scripts/all.js",
        "/public/scripts/device-intelligence.js",
        "/public/style.css",
        "/public/scripts",
        "/public/scripts/application.js",
        "/public/scripts/showPassword.js",
        "/assets/images/govuk-crest.png",
        "/assets/images/govuk-crest-2x.png",
        "/assets/fonts/bold-b542beb274-v2.woff2",
        "/assets/fonts/bold-b542beb274-v2.woff2",
        "/assets/images/favicon.ico",
        "/assets/fonts/light-94a07e06a1-v2.woff2",
        "/healthcheck",
        "/healthcheck/",
      ].includes(req.url),
  },
  customErrorMessage: function (_req, res) {
    return `request errored with status code: ${res.statusCode}`;
  },
  customSuccessMessage: function (_req, res) {
    if (res.statusCode === 404) {
      return "resource not found";
    }
    return `request completed with status code of: ${res.statusCode}`;
  },
  customAttributeKeys: {
    responseTime: "timeTaken",
  },
});

export { logger, loggerMiddleware };
