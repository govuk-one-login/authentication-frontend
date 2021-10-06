export function getLogLevel(): string {
  return process.env.LOGS_LEVEL || "debug";
}

export function getApiBaseUrl(): string {
  return process.env.API_BASE_URL;
}

export function getFrontendApiBaseUrl(): string {
  return process.env.FRONTEND_API_BASE_URL;
}

export function getNodeEnv(): string {
  return process.env.NODE_ENV || "development";
}

export function getSessionExpiry(): number {
  return Number(process.env.SESSION_EXPIRY);
}

export function getSessionSecret(): string {
  return process.env.SESSION_SECRET;
}

export function getApiKey(): string {
  return process.env.API_KEY;
}

export function getGtmId(): string {
  return process.env.GTM_ID;
}

export function getAnalyticsCookieDomain(): string {
  return process.env.ANALYTICS_COOKIE_DOMAIN;
}
