import { pino } from "pino";
import { pinoHttp } from "pino-http";
import { getLogLevel } from "../config.js";
import type { Request, Response } from "express";

const SENSITIVE_PARAMS = ["request", "code"];
const BASE_PLACEHOLDER = "https://placeholder";

export const redactQueryParams = (
  url: string | undefined
): string | undefined => {
  if (url?.includes("?")) {
    try {
      const parsedUrl = new URL(url, BASE_PLACEHOLDER);
      for (const param of SENSITIVE_PARAMS) {
        if (parsedUrl.searchParams.has(param)) {
          parsedUrl.searchParams.set(param, "hidden");
        }
      }
      return parsedUrl.pathname + parsedUrl.search;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // ignore
    }
  }
  return url;
};

// Global logger for use outside of a request context
// Per-request logging should use req.log instead so it is populated with request context
const logger = pino({
  name: "di-auth",
  level: getLogLevel(),
  serializers: {
    req: (req: Request) => {
      return {
        id: req.id,
        method: req.method,
        url: redactQueryParams(req.url),
        from: getRefererFrom(req.headers.referer),
      };
    },
    res: (res: Response) => {
      return {
        status: res.statusCode,
        languageFromCookie: res.locals.language?.toUpperCase(),
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

export const addRequestContext = (
  req: Request,
  res: Response,
  val?: object
): object => ({
  ...val,
  clientId: res.locals.clientId,
  govuk_journey_id: res.locals.clientSessionId ?? "unknown",
  persistentSessionId: res.locals.persistentSessionId,
  sessionId: res.locals.sessionId,
});

const loggerMiddleware = pinoHttp({
  logger,
  wrapSerializers: false,
  autoLogging: {
    ignore: (req) =>
      [
        "/public/scripts/analytics.js",
        "/public/scripts/dataLayerEvents.js",
        "/public/scripts/govuk-frontend.min.js",
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
  customErrorObject: addRequestContext,
  customSuccessMessage: function (_req, res) {
    if (res.statusCode === 404) {
      return "resource not found";
    }
    return `request completed with status code of: ${res.statusCode}`;
  },
  customSuccessObject: addRequestContext,
  customAttributeKeys: {
    responseTime: "timeTaken",
  },
});

export { logger, loggerMiddleware };
