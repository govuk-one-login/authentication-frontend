import pino from "pino";
import PinoHttp from "pino-http";
import { getLogLevel } from "../config";

const logger = pino({
  name: "di-auth",
  level: getLogLevel(),
  serializers: {
    req: (req) => {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
      };
    },
    res: (res) => {
      return {
        id: res.id,
        method: res.method,
        url: res.url,
        sessionId: res.locals.sessionId,
        clientSessionId: res.locals.clientSessionId,
      };
    },
  },
});

const loggerMiddleware = PinoHttp({
  logger,
  wrapSerializers: false,
  autoLogging: {
    ignorePaths: [
      "/public/scripts/cookies.js",
      "/public/style.css",
      "/public/scripts/application.js",
      "/assets/images/govuk-crest-2x.png",
      "/assets/fonts/bold-b542beb274-v2.woff2",
      "/assets/fonts/bold-b542beb274-v2.woff2",
      "/assets/images/favicon.ico",
      "/assets/fonts/light-94a07e06a1-v2.woff2",
    ],
  },
  customErrorMessage: function (error, res) {
    return "request errored with status code: " + res.statusCode;
  },
  customSuccessMessage: function (res) {
    if (res.statusCode === 404) {
      return "resource not found";
    }
    return `request completed with status code of:${res.statusCode}`;
  },
  customAttributeKeys: {
    responseTime: "timeTaken",
  },
});

export { logger, loggerMiddleware };
