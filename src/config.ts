export const getLogFilePath = (): string => {
  return process.env.LOGS_FILE_PATH || "/logs.json";
};
export const getLogLevel = (): string => {
  return process.env.LOGS_LEVEL || "debug";
};
export const enableAnsiLog = (): boolean => {
  return process.env.ANSI_LOG === "true";
};
