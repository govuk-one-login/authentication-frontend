import { CHANNEL } from "./app.constants.js";
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

export function getAppEnv(): string {
  return process.env.APP_ENV || "local";
}

export function getSessionExpiry(): number {
  return Number(process.env.SESSION_EXPIRY) || 3600000;
}

export function getSessionSecret(): string {
  return process.env.SESSION_SECRET;
}

export function getApiKey(): string {
  return process.env.API_KEY;
}

export function supportAccountRecovery(): boolean {
  return process.env.SUPPORT_ACCOUNT_RECOVERY === "1";
}

export function supportAuthorizeController(): boolean {
  return process.env.SUPPORT_AUTHORIZE_CONTROLLER === "1";
}

export function getSupportLinkUrl(): string {
  return process.env.URL_FOR_SUPPORT_LINKS || "/contact-us";
}

export function getAwsRegion(): string {
  return process.env.AWS_REGION || "eu-west-2";
}

export function getKmsKeyId(): string {
  return process.env.ENCRYPTION_KEY_ID;
}

export function getVitalSignsIntervalSeconds(): number {
  return Number(process.env.VITAL_SIGNS_INTERVAL_SECONDS) || 10;
}

export function getOrchToAuthSigningPublicKey(): string {
  return process.env.ORCH_TO_AUTH_SIGNING_KEY;
}

export function getOrchToAuthExpectedClientId(): string {
  return process.env.ORCH_TO_AUTH_CLIENT_ID || "UNKNOWN";
}

export function getOrchToAuthExpectedAudience(): string {
  return process.env.ORCH_TO_AUTH_AUDIENCE || "UNKNOWN";
}

export function getOrchStubToAuthSigningPublicKey(): string {
  return process.env.ORCH_STUB_TO_AUTH_SIGNING_KEY || "UNKNOWN";
}

export function getOrchStubToAuthExpectedClientId(): string {
  return process.env.ORCH_STUB_TO_AUTH_CLIENT_ID || "UNKNOWN";
}

export function getOrchStubToAuthExpectedAudience(): string {
  return process.env.ORCH_STUB_TO_AUTH_AUDIENCE || "UNKNOWN";
}

export function getAccountManagementUrl(): string {
  return process.env.ACCOUNT_MANAGEMENT_URL || "http://localhost:6001";
}

export function getAnalyticsCookieDomain(): string {
  return process.env.ANALYTICS_COOKIE_DOMAIN;
}

export function getGoogleAnalyticsAndDynatraceCookieDomain(): string {
  return getServiceDomain() === "localhost" ? "localhost" : ".account.gov.uk";
}

export function getServiceDomain(): string {
  return process.env.SERVICE_DOMAIN || "localhost";
}

export function getSmartAgentApiKey(): string {
  return process.env.SMARTAGENT_API_KEY || "";
}
export function getSmartAgentApiUrl(): string {
  return process.env.SMARTAGENT_API_URL || "";
}

export function getSmartAgentWebformId(): string {
  return process.env.SMARTAGENT_WEBFORM_ID || "";
}

export function getServiceSignInLink(): string {
  return process.env.SERVICE_SIGN_IN_LINK || "https://www.gov.uk/sign-in";
}

export function getCodeRequestBlockDurationInMinutes(): number {
  return Number(process.env.CODE_REQUEST_BLOCKED_MINUTES) || 15;
}

export function getCodeEnteredWrongBlockDurationInMinutes(): number {
  return Number(process.env.CODE_ENTERED_WRONG_BLOCKED_MINUTES) || 15;
}

export function getReducedBlockDurationInMinutes(): number {
  return Number(process.env.REDUCED_CODE_BLOCK_DURATION_MINUTES) || 15;
}

export function getAccountRecoveryCodeEnteredWrongBlockDurationInMinutes(): number {
  return (
    Number(process.env.ACCOUNT_RECOVERY_CODE_ENTERED_WRONG_BLOCKED_MINUTES) ||
    15
  );
}

export function getPasswordResetCodeEnteredWrongBlockDurationInMinutes(): number {
  return (
    Number(process.env.PASSWORD_RESET_CODE_ENTERED_WRONG_BLOCKED_MINUTES) || 15
  );
}

export function supportNoPhotoIdContactForms(): boolean {
  return process.env.NO_PHOTO_ID_CONTACT_FORMS === "1";
}

export function supportAccountInterventions(): boolean {
  return process.env.SUPPORT_ACCOUNT_INTERVENTIONS === "1";
}

export function supportReauthentication(): boolean {
  return process.env.SUPPORT_REAUTHENTICATION === "1";
}

export function supportCheckEmailFraud(): boolean {
  return process.env.SUPPORT_CHECK_EMAIL_FRAUD === "1";
}

export function getDefaultChannel(): string {
  const configuredChannel = process.env.DEFAULT_CHANNEL;
  if (isValidChannel(configuredChannel)) {
    return configuredChannel;
  } else {
    return CHANNEL.WEB;
  }
}

export function getLanguageToggleEnabled(): boolean {
  return process.env.LANGUAGE_TOGGLE_ENABLED === "1";
}

export function getGA4ContainerId(): string {
  return process.env.GOOGLE_ANALYTICS_4_GTM_CONTAINER_ID || "";
}

export function googleAnalytics4Enabled(): string {
  return process.env.GA4_ENABLED || "false";
}

export function supportNewIpvSpinner(): boolean {
  return process.env.SUPPORT_NEW_IPV_SPINNER === "1";
}
export function supportHttpKeepAlive(): boolean {
  return process.env.SUPPORT_HTTP_KEEP_ALIVE === "1";
}

export function isValidChannel(channel: string): boolean {
  return channel === CHANNEL.WEB || channel === CHANNEL.STRATEGIC_APP;
}

export function showTestBanner(): boolean {
  return getAppEnv() !== "production" || process.env.SHOW_TEST_BANNER === "1";
}

export function getDeviceIntelligenceEnabled(): boolean {
  return process.env.DEVICE_INTELLIGENCE_ENABLED === "1";
}
