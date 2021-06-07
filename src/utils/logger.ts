import {winstonLogger} from "./winston";

enum SEVERITY {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface ILoggerPayload {
  user_agent?: any;
  error?: any;
}

interface ILogger {
  error: (message: string, label: string, payload?: ILoggerPayload) => void;
  debug: (message: string, label: string, payload?: ILoggerPayload) => void;
  warn: (message: string, label: string, payload?: ILoggerPayload) => void;
  info: (message: string, label: string, payload?: ILoggerPayload) => void;
}

export default class Logger implements ILogger {
  error(message: string, label: string, payload?: ILoggerPayload): void {
    this.console(message, label, SEVERITY.ERROR, payload);
  }

  debug(message: string, label: string, payload?: ILoggerPayload): void {
    this.console(message, label, SEVERITY.DEBUG, payload);
  }

  warn(message: string, label: string, payload?: ILoggerPayload): void {
    this.console(message, label, SEVERITY.WARN, payload);
  }

  info(message: string, label: string, payload?: ILoggerPayload): void {
    this.console(message, label, SEVERITY.INFO, payload);
  }

  console(
    message: string,
    label: string,
    severity: SEVERITY,
    payload: ILoggerPayload
  ): void {
    switch (severity) {
      case SEVERITY.DEBUG:
        winstonLogger.debug(message, { label, ...payload });
        break;
      case SEVERITY.INFO:
        winstonLogger.info(message, { label, ...payload });
        break;
      case SEVERITY.WARN:
        winstonLogger.warn(message, { label, ...payload });
        break;
      case SEVERITY.ERROR:
        winstonLogger.error(message, { label, ...payload });
        break;
      default:
        break;
    }
  }
}

export function getLogLabel(path: string): string {
  const paths: string[] = path.split("\\").pop().split("/");
  return paths[paths.length - 2] + "/" + paths[paths.length - 1];
}
