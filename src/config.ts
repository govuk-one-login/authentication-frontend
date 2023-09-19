import { RedisConfig } from "./utils/types";
import ssm from "./utils/ssm";
import { Parameter } from "aws-sdk/clients/ssm";

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

export function supportInternationalNumbers(): boolean {
  return process.env.SUPPORT_INTERNATIONAL_NUMBERS === "1";
}

export function supportLanguageCY(): boolean {
  return process.env.SUPPORT_LANGUAGE_CY === "1";
}

export function supportAccountRecovery(): boolean {
  return process.env.SUPPORT_ACCOUNT_RECOVERY === "1";
}

export function supportAuthOrchSplit(): boolean {
  return process.env.SUPPORT_AUTH_ORCH_SPLIT === "1";
}

export function supportSmartAgent(): boolean {
  return process.env.SUPPORT_SMART_AGENT === "1";
}

export async function getRedisConfig(appEnv: string): Promise<RedisConfig> {
  const hostKey = `${appEnv}-${process.env.REDIS_KEY}-redis-master-host`;
  const portKey = `${appEnv}-${process.env.REDIS_KEY}-redis-port`;
  const passwordKey = `${appEnv}-${process.env.REDIS_KEY}-redis-password`;

  const params = {
    Names: [hostKey, portKey, passwordKey],
    WithDecryption: true,
  };

  const result = await ssm.getParameters(params).promise();

  if (result.InvalidParameters && result.InvalidParameters.length > 0) {
    throw Error("Invalid SSM config values for redis");
  }

  return {
    password: result.Parameters.find((p: Parameter) => p.Name === passwordKey)
      .Value,
    host: result.Parameters.find((p: Parameter) => p.Name === hostKey).Value,
    port: Number(
      result.Parameters.find((p: Parameter) => p.Name === portKey).Value
    ),
    isLocal: false,
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

export function getAccountManagementUrl(): string {
  return process.env.ACCOUNT_MANAGEMENT_URL || "http://localhost:6001";
}

export function getZendeskUser(): string {
  return process.env.ZENDESK_USERNAME;
}

export function getZendeskToken(): string {
  return process.env.ZENDESK_API_TOKEN;
}

export function getZendeskAPIUrl(): string {
  return process.env.ZENDESK_API_URL ?? "https://govuk.zendesk.com/api/v2/";
}

export function getZendeskGroupIdPublic(): number {
  return Number(process.env.ZENDESK_GROUP_ID_PUBLIC);
}

export function getAnalyticsCookieDomain(): string {
  return process.env.ANALYTICS_COOKIE_DOMAIN;
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
