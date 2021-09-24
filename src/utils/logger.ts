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
      };
    },
  },
});

const loggerMiddleware = PinoHttp({
  logger,
  autoLogging: false,
  wrapSerializers: false,
});

export { logger, loggerMiddleware };
