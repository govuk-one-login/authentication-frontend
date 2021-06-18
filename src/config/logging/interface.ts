export enum SEVERITY {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface ApplicationLoggerPayload {
  sessionId?: string;
  userAgent?: any;
  error?: any;
}

export interface ApplicationLogger {
  error: (
    message: string,
    label: string,
    payload?: ApplicationLoggerPayload
  ) => void;
  debug: (
    message: string,
    label: string,
    payload?: ApplicationLoggerPayload
  ) => void;
  warn: (
    message: string,
    label: string,
    payload?: ApplicationLoggerPayload
  ) => void;
  info: (
    message: string,
    label: string,
    payload?: ApplicationLoggerPayload
  ) => void;
}
