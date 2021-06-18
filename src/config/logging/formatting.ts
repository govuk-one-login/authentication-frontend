import { format } from "winston";
import path from "path";

export const logFormat = format.combine(
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
      session_id: info.sessionId,
      body: {
        subject: info.stack ? info.name : info.message,
        stack: info.stack,
        label: info.label,
        error: info.error,
        user_agent: info.userAgent
          ? {
              browser: info.userAgent.browser,
              version: info.userAgent.version,
              os: info.userAgent.os,
              platform: info.userAgent.platform,
              source: info.userAgent.source,
              isDesktop: info.userAgent.isDesktop,
              isMobile: info.userAgent.isMobile,
              isTablet: info.userAgent.isTablet,
              isCurl: info.userAgent.isCurl,
              isBot: info.userAgent.isBot,
            }
          : undefined,
      },
    };
    return JSON.stringify(formattedInfo);
  })
);

const consoleLogFormat = format.combine(
  format.errors({ stack: true }),
  format.timestamp(),
  format.printf((info) => {
    const label = info.label ? ` [${info.label}]` : "";
    const session_id = info.session_id ? `[${info.session_id}]` : "";
    const formattedDate = info.timestamp.replace("T", " ").replace("Z", "");
    return `${formattedDate} ${info.level}:${label} ${info.message} ${session_id}`;
  })
);

export function getConsoleLogFormat(isAnsiLogging: boolean) {
  if (isAnsiLogging) {
    return format.combine(consoleLogFormat, format.colorize({ all: true }));
  }
  return consoleLogFormat;
}
