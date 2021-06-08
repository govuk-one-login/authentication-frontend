import {format, transports} from "winston";
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

export function getConsoleLogFormat(isAnsiLogging: boolean){
    if(isAnsiLogging){
        return format.combine(
            consoleLogFormat,
            format.colorize({ all: true })
        );
    }
    return consoleLogFormat
}