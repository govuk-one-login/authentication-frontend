import pino from "pino";
import PinoHttp from "pino-http";
import { getLogLevel } from "../config";
import { Request, Response } from "express";
import { type IncomingHttpHeaders } from "http";

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
        headers: sanitiseReferer(req.headers),
      };
    },
    res: (res: Response) => {
      return {
        status: res.statusCode,
        sessionId: res.locals.sessionId,
        clientSessionId: res.locals.clientSessionId,
        persistentSessionId: res.locals.persistentSessionId,
        languageFromCookie: res.locals.language?.toUpperCase(),
      };
    },
  },
});

export const sanitiseReferer = (headers: IncomingHttpHeaders) => {
  try {
    if (headers.referer) {
      const emailRegex = /[\w-.]+@([\w-]+\.)+[\w-]{2,4}/;
      const sanitisedReferer = headers.referer.replace(emailRegex, "REDACTED");
      return {
        ...headers,
        referer: sanitisedReferer,
      };
    }
    return headers;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return headers;
  }
};

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

const loggerMiddleware = PinoHttp({
  logger,
  wrapSerializers: false,
  autoLogging: {
    ignore: (req) =>
      [
        "/public/scripts/analytics.js",
        "/public/scripts/dataLayerEvents.js",
        "/public/scripts/all.js",
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
