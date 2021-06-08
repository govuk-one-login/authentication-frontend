/**
 * Sample file output
 *
 * {
 *     "timestamp": "2020-07-20T15:45:16.374Z",
 *     "tag": "",
 *     "process_name": "",
 *     "process_id": "",
 *     "log-path": "",
 *     "severity": "informational",
 *     "body": [{
 *         "subject": "",
 *         "key1": "value1",
 *         "key2": "value2"
 *     }]
 * }

 */

import { transports, format, createLogger } from "winston";
import * as config from "../config";
import { getLogLevel } from "../config";
import path from "path";

const logFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.printf((info) => {
    const formattedInfo = {
      timestamp: info.timestamp,
      tag: info.service,
      process_name: path.parse(process.argv[1]).base,
      process_id: process.pid,
      "log-path": info["log-path"],
      severity: info.level,
      body: {
        subject: info.stack ? info.name : info.message,
        stack: info.stack,
        label: info.label,
        user_agent: info.user_agent
          ? {
              browser: info.user_agent.browser,
              version: info.user_agent.version,
              os: info.user_agent.os,
              platform: info.user_agent.platform,
              source: info.user_agent.source,
              isDesktop: info.user_agent.isDesktop,
              isMobile: info.user_agent.isMobile,
              isTablet: info.user_agent.isTablet,
              isCurl: info.user_agent.isCurl,
              isBot: info.user_agent.isBot,
            }
          : undefined,
        declaration: info.declaration,
      },
    };
    return JSON.stringify(formattedInfo);
  })
);

let consoleLogFormat = format.combine(
  format.errors({ stack: true }),
  format.timestamp(),
  format.printf((info) => {
    const label = info.label ? ` [${info.label}]` : "";
    const formattedDate = info.timestamp.replace("T", " ").replace("Z", "");
    return `${formattedDate} ${info.level}:${label} ${info.message}`;
  })
);

if (config.enableAnsiLog()) {
  consoleLogFormat = format.combine(
    consoleLogFormat,
    format.colorize({ all: true })
  );
}

const logPath = process.cwd() + config.getLogFilePath();

const devTransports = [
  new transports.File({
    filename: logPath,
    maxsize: 5242880,
    format: logFormat,
  }),
  new transports.Console({
    format: consoleLogFormat,
  }),
];

const otherTransports = [
  new transports.Console({
    format: logFormat,
  }),
];

export const winstonLogger = createLogger({
  defaultMeta: { service: "di-auth", "log-path": logPath },
  level: getLogLevel(),
  transports:
    process.env.NODE_ENV == "development" ? devTransports : otherTransports,
});
