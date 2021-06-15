export function getLogFilePath(): string {
  return process.env.LOGS_FILE_PATH || "/logs.json";
}

export function getLogLevel(): string {
  return process.env.LOGS_LEVEL || "debug";
}

export function enableAnsiLog(): boolean {
  return process.env.ANSI_LOG === "true";
}

export function apiBaseUrl(): string {
  return process.env.API_BASE_URL;
}

export function getNodeEnv(): string {
  return process.env.NODE_ENV || "development";
}
