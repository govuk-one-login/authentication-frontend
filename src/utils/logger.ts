import winstonLogger from "../config/logging/winston";
import {
  ApplicationLogger,
  ApplicationLoggerPayload,
  SEVERITY,
} from "../config/logging/interface";

export default class Logger implements ApplicationLogger {
  error(
    message: string,
    label: string,
    payload?: ApplicationLoggerPayload
  ): void {
    this.console(message, label, SEVERITY.ERROR, payload);
  }

  debug(
    message: string,
    label: string,
    payload?: ApplicationLoggerPayload
  ): void {
    this.console(message, label, SEVERITY.DEBUG, payload);
  }

  warn(
    message: string,
    label: string,
    payload?: ApplicationLoggerPayload
  ): void {
    this.console(message, label, SEVERITY.WARN, payload);
  }

  info(
    message: string,
    label: string,
    payload?: ApplicationLoggerPayload
  ): void {
    this.console(message, label, SEVERITY.INFO, payload);
  }

  request(
    message: string,
    label: string,
    payload?: ApplicationLoggerPayload
  ): void {
    this.console(message, label, SEVERITY.INFO, payload);
  }

  audit(
    message: string,
    label: string,
    payload?: ApplicationLoggerPayload
  ): void {
    this.console(message, label, SEVERITY.INFO, payload);
  }

  private console(
    message: string,
    label: string,
    severity: SEVERITY,
    payload: ApplicationLoggerPayload
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
