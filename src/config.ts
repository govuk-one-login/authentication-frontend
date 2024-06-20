import { RedisConfig } from "./utils/types";
import ssm from "./utils/ssm";
import { Parameter } from "@aws-sdk/client-ssm";
import { ENVIRONMENT_NAME } from "./app.constants";

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

export function getRedisHost(): string {
  return process.env.REDIS_HOST ?? "redis";
}

export function getRedisPort(): number {
  return Number(process.env.REDIS_PORT) ?? 6379;
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

export async function getRedisConfig(): Promise<RedisConfig> {
  if (getNodeEnv() !== ENVIRONMENT_NAME.PROD) {
    return { host: getRedisHost(), port: getRedisPort() };
  }

  const appEnv = getAppEnv();
  const hostKey = `${appEnv}-${process.env.REDIS_KEY}-redis-master-host`;
  const portKey = `${appEnv}-${process.env.REDIS_KEY}-redis-port`;
  const passwordKey = `${appEnv}-${process.env.REDIS_KEY}-redis-password`;

  const params = {
    Names: [hostKey, portKey, passwordKey],
    WithDecryption: true,
  };

  const result = await ssm.getParameters(params);

  if (result.InvalidParameters && result.InvalidParameters.length > 0) {
    throw Error("Invalid SSM config values for redis");
  }

  return {
    host: result.Parameters.find((p: Parameter) => p.Name === hostKey).Value,
    port: Number(
      result.Parameters.find((p: Parameter) => p.Name === portKey).Value
    ),
    password: result.Parameters.find((p: Parameter) => p.Name === passwordKey)
      .Value,
    tls: true,
  };
}

export function getAwsRegion(): string {
  return process.env.AWS_REGION || "eu-west-2";
}

export function getKmsKeyId(): string {
  return process.env.ENCRYPTION_KEY_ID;
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

export function support2FABeforePasswordReset(): boolean {
  return process.env.SUPPORT_2FA_B4_PASSWORD_RESET === "1";
}

export function support2hrLockout(): boolean {
  return process.env.SUPPORT_2HR_LOCKOUT === "1";
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

export function getLanguageToggleEnabled(): boolean {
  return process.env.LANGUAGE_TOGGLE_ENABLED === "1";
}

export function getEmailEnteredWrongBlockDurationInMinutes(): number {
  return Number(process.env.EMAIL_ENTERED_WRONG_BLOCKED_MINUTES) || 15;
}

export function getGA4ContainerId(): string {
  return process.env.GOOGLE_ANALYTICS_4_GTM_CONTAINER_ID || "";
}

export function getGTMContainerID(): string {
  return process.env.UNIVERSAL_ANALYTICS_GTM_CONTAINER_ID || "";
}

export function googleAnalytics4Disabled(): string {
  return process.env.GA4_DISABLED || "true";
}

export function universalAnalyticsDisabled(): string {
  return process.env.UA_DISABLED || "false";
}
export function proveIdentityWelcomeEnabled(): boolean {
  return process.env.PROVE_IDENTITY_WELCOME_ENABLED === "1";
}

export function supportNewIpvSpinner(): boolean {
  return process.env.SUPPORT_NEW_IPV_SPINNER === "1";
}
