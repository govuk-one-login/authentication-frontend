import { PATH_NAMES } from "../../../app.constants.js";

export type StatusBannerComponent = "notification-banner" | "warning-text";

export const ALL_PAGES = "all";

export interface StatusBannerScenario {
  component: StatusBannerComponent;
  translationKeyPrefix: string;
  shownOnPaths: readonly string[] | typeof ALL_PAGES;
}

export const STATUS_BANNER_SCENARIOS = {
  "sms-delays": {
    component: "notification-banner",
    translationKeyPrefix: "general.statusBanner.smsDelays",
    shownOnPaths: [
      PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
      PATH_NAMES.CHECK_YOUR_PHONE,
      PATH_NAMES.ENTER_MFA,
      PATH_NAMES.RESEND_MFA_CODE,
      PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION,
      PATH_NAMES.RESET_PASSWORD_2FA_SMS,
      PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS,
    ],
  },
  "email-delays": {
    component: "notification-banner",
    translationKeyPrefix: "general.statusBanner.emailDelays",
    shownOnPaths: [
      PATH_NAMES.CHECK_YOUR_EMAIL,
      PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL,
      PATH_NAMES.RESEND_EMAIL_CODE,
    ],
  },
  "password-reset-unavailable": {
    component: "notification-banner",
    translationKeyPrefix: "general.statusBanner.passwordResetUnavailable",
    shownOnPaths: [
      PATH_NAMES.ENTER_PASSWORD,
      PATH_NAMES.ENTER_PASSWORD_ACCOUNT_EXISTS,
      PATH_NAMES.RESET_PASSWORD_REQUEST,
      PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL,
      PATH_NAMES.RESET_PASSWORD_RESEND_CODE,
      PATH_NAMES.RESET_PASSWORD_2FA_SMS,
      PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS,
      PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP,
      PATH_NAMES.RESET_PASSWORD,
    ],
  },
  "service-issues": {
    component: "warning-text",
    translationKeyPrefix: "general.statusBanner.serviceIssues",
    shownOnPaths: ALL_PAGES,
  },
} as const satisfies Record<string, StatusBannerScenario>;

export type StatusBannerScenarioId = keyof typeof STATUS_BANNER_SCENARIOS;

export function getStatusBannerScenario(
  scenarioId: string
): StatusBannerScenario | undefined {
  return Object.prototype.hasOwnProperty.call(
    STATUS_BANNER_SCENARIOS,
    scenarioId
  )
    ? STATUS_BANNER_SCENARIOS[scenarioId as StatusBannerScenarioId]
    : undefined;
}

export function isShownOnPath(
  scenario: StatusBannerScenario,
  path: string
): boolean {
  return (
    scenario.shownOnPaths === ALL_PAGES || scenario.shownOnPaths.includes(path)
  );
}

export function singleLineTranslationKeys(
  scenario: StatusBannerScenario
): string[] {
  return scenario.component === "notification-banner"
    ? [`${scenario.translationKeyPrefix}.title`]
    : [];
}

export function paragraphsTranslationKey(
  scenario: StatusBannerScenario
): string {
  return `${scenario.translationKeyPrefix}.paragraphs`;
}
