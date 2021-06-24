import { createLogger, transports } from "winston";
import { getLogLevel } from "../../config";
import * as config from "../../config";
import { getConsoleLogFormat, logFormat } from "./formatting";

const LOG_PATH = process.cwd() + config.getLogFilePath();

const devTransports = [
  new transports.File({
    filename: LOG_PATH,
    maxsize: 5242880,
    format: logFormat,
  }),
  new transports.Console({
    format: getConsoleLogFormat(config.enableAnsiLog()),
  }),
];

const otherTransports = [
  new transports.Console({
    format: logFormat,
  }),
];

const logger = createLogger({
  defaultMeta: { service: "di-auth", "log-path": LOG_PATH },
  level: getLogLevel(),
  transports:
    config.getNodeEnv() == "development" ? devTransports : otherTransports,
});

export default logger;
