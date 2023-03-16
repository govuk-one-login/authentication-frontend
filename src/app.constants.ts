export const PATH_NAMES = {
  START: "/",
  ACCESSIBILITY_STATEMENT: "/accessibility-statement",
  TERMS_AND_CONDITIONS: "/terms-and-conditions",
  PRIVACY_POLICY: "/privacy-notice",
  PRIVACY_STATEMENT: "/privacy-statement",
  SUPPORT: "/support",
  SIGN_IN_OR_CREATE: "/sign-in-or-create",
  ENTER_EMAIL_CREATE_ACCOUNT: "/enter-email-create",
  ENTER_EMAIL_SIGN_IN: "/enter-email",
  ACCOUNT_NOT_FOUND: "/account-not-found",
  CHECK_YOUR_EMAIL: "/check-your-email",
  ENTER_PASSWORD: "/enter-password",
  ENTER_PASSWORD_ACCOUNT_EXISTS: "/enter-password-account-exists",
  RESET_PASSWORD_CHECK_EMAIL: "/reset-password-check-email",
  RESET_PASSWORD: "/reset-password",
  RESET_PASSWORD_REQUIRED: "/reset-password-required",
  RESET_PASSWORD_REQUEST: "/reset-password-request",
  RESET_PASSWORD_RESEND_CODE: "/reset-password-resend-code",
  CREATE_ACCOUNT_CHECK_EMAIL: "/check-email",
  CREATE_ACCOUNT_SET_PASSWORD: "/create-password",
  CREATE_ACCOUNT_ENTER_PHONE_NUMBER: "/enter-phone-number",
  CREATE_ACCOUNT_SUCCESSFUL: "/account-created",
  CHECK_YOUR_PHONE: "/check-your-phone",
  SHARE_INFO: "/share-info",
  UPDATED_TERMS_AND_CONDITIONS: "/updated-terms-and-conditions",
  UPDATED_TERMS_AND_CONDITIONS_DISAGREE:
    "/updated-terms-and-conditions-disagree",
  ENTER_MFA: "/enter-code",
  SECURITY_CODE_INVALID: "/security-code-invalid",
  SECURITY_CODE_REQUEST_EXCEEDED: "/security-code-requested-too-many-times",
  SECURITY_CODE_WAIT: "/security-code-invalid-request",
  SECURITY_CODE_CHECK_TIME_LIMIT: "/security-code-check-time-limit",
  AUTH_CODE: "/auth-code",
  RESEND_MFA_CODE: "/resend-code",
  RESEND_EMAIL_CODE: "/resend-email-code",
  SIGNED_OUT: "/signed-out",
  ACCOUNT_LOCKED: "/account-locked",
  SIGN_IN_RETRY_BLOCKED: "/sign-in-retry-blocked",
  UPLIFT_JOURNEY: "/uplift",
  CONTACT_US: "/contact-us",
  CONTACT_US_SUBMIT_SUCCESS: "/contact-us-submit-success",
  CONTACT_US_FURTHER_INFORMATION: "/contact-us-further-information",
  CONTACT_US_QUESTIONS: "/contact-us-questions",
  PROVE_IDENTITY: "/prove-identity",
  DOC_CHECKING_APP: "/doc-checking-app",
  DOC_CHECKING_APP_CALLBACK: "/doc-app-callback",
  PROVE_IDENTITY_CALLBACK: "/ipv-callback",
  HEALTHCHECK: "/healthcheck",
  PROVE_IDENTITY_WELCOME: "/prove-identity-welcome",
  GET_SECURITY_CODES: "/get-security-codes",
  ENTER_AUTHENTICATOR_APP_CODE: "/enter-authenticator-app-code",
  CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP: "/setup-authenticator-app",
  COOKIES_POLICY: "/cookies",
  ERROR_PAGE: "/error",
  PHOTO_ID: "/photo-id",
  NO_PHOTO_ID: "/no-photo-id",
  SECURITY_CODE_ENTERED_EXCEEDED: "/security-code-entered-exceeded",
  CHANGE_SECURITY_CODES: "/change-security-codes",
  CANNOT_CHANGE_SECURITY_CODES: "/cannot-change-security-codes",
};

export const HTTP_STATUS_CODES = {
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  OK: 200,
  NO_CONTENT: 204,
  REDIRECT: 303,
};

export const API_ERROR_CODES = {
  SESSION_ID_MISSING_OR_INVALID: 1000,
};

export enum LOCALE {
  EN = "en",
  CY = "cy",
}

export const API_ENDPOINTS = {
  USER_EXISTS: "/user-exists",
  SIGNUP_USER: "/signup",
  SEND_NOTIFICATION: "/send-notification",
  VERIFY_CODE: "/verify-code",
  LOG_IN_USER: "/login",
  UPDATE_PROFILE: "/update-profile",
  MFA: "/mfa",
  AUTH_CODE: "/auth-code",
  START: "/start",
  RESET_PASSWORD_REQUEST: "/reset-password-request",
  RESET_PASSWORD: "/reset-password",
  IPV_AUTHORIZE: "/ipv-authorize",
  DOC_CHECKING_APP_AUTHORIZE: "/doc-app-authorize",
  IPV_PROCESSING_IDENTITY: "/processing-identity",
  VERIFY_MFA_CODE: "/verify-mfa-code",
  ACCOUNT_RECOVERY: "/account-recovery",
};

export const ERROR_MESSAGES = {
  FAILED_HTTP_REQUEST: "Failed HTTP request",
  INVALID_CSRF_TOKEN: "Invalid CSRF token",
  INVALID_SESSION: "Invalid session",
  INVALID_HTTP_REQUEST: "Invalid HTTP request",
  FORBIDDEN: "Unauthorized HTTP request",
  INTERNAL_SERVER_ERROR: "Internal server error",
  PAGE_NOT_FOUND: "Request page not found",
};

export const ERROR_LOG_LEVEL = {
  ERROR: "Error",
  INFO: "Info",
};

export const SERVICE_TYPE = {
  MANDATORY: "MANDATORY",
  OPTIONAL: "OPTIONAL",
};

export const ZENDESK_THEMES = {
  ACCOUNT_CREATION: "account_creation",
  SIGNING_IN: "signing_in",
  SOMETHING_ELSE: "something_else",
  EMAIL_SUBSCRIPTIONS: "email_subscriptions",
  SUGGESTIONS_FEEDBACK: "suggestions_feedback",
  ACCOUNT_NOT_FOUND: "account_not_found",
  TECHNICAL_ERROR: "technical_error",
  NO_SECURITY_CODE: "no_security_code",
  INVALID_SECURITY_CODE: "invalid_security_code",
  NO_UK_MOBILE_NUMBER: "no_uk_mobile_number",
  FORGOTTEN_PASSWORD: "forgotten_password",
  NO_PHONE_NUMBER_ACCESS: "no_phone_number_access",
  PROVING_IDENTITY: "proving_identity",
  AUTHENTICATOR_APP_PROBLEM: "authenticator_app_problem",
  ID_CHECK_APP: "id_check_app",
  LINKING_PROBLEM: "linking_problem",
  TAKING_PHOTO_OF_ID_PROBLEM: "taking_photo_of_id_problem",
  FACE_SCANNING_PROBLEM: "face_scanning_problem",
  ID_CHECK_APP_TECHNICAL_ERROR: "id_check_app_technical_problem",
  ID_CHECK_APP_SOMETHING_ELSE: "id_check_app_something_else",
};

export const ZENDESK_FIELD_MAX_LENGTH = 1200;

export const PLACEHOLDER_REPLACEMENTS = [
  {
    search: "[maximumCharacters]",
    replacement: ZENDESK_FIELD_MAX_LENGTH.toLocaleString(),
  },
];

export enum NOTIFICATION_TYPE {
  VERIFY_EMAIL = "VERIFY_EMAIL",
  VERIFY_PHONE_NUMBER = "VERIFY_PHONE_NUMBER",
  ACCOUNT_CREATED_CONFIRMATION = "ACCOUNT_CREATED_CONFIRMATION",
  MFA_SMS = "MFA_SMS",
  RESET_PASSWORD_WITH_CODE = "RESET_PASSWORD_WITH_CODE",
}

export const COOKIE_CONSENT = {
  ACCEPT: "accept",
  REJECT: "reject",
  NOT_ENGAGED: "not-engaged",
};

export enum SUPPORT_TYPE {
  GOV_SERVICE = "GOV_SERVICE",
  PUBLIC = "PUBLIC",
}

export enum MFA_METHOD_TYPE {
  SMS = "SMS",
  AUTH_APP = "AUTH_APP",
}

export const ENVIRONMENT_NAME = {
  PROD: "production",
  DEV: "development",
};

export const APP_ENV_NAME = {
  PROD: "production",
  INT: "integration",
  BUILD: "build",
  LOCAL: "local",
};

export const EXTERNAL_LINKS = {
  GOV_UK: "https://www.gov.uk/",
};

export const OIDC_PROMPT = {
  LOGIN: "LOGIN",
  NONE: "NONE",
};

export const OIDC_ERRORS = {
  ACCESS_DENIED: "access_denied",
};

export const IPV_ERROR_CODES = {
  ACCOUNT_NOT_CREATED: "Account not created",
  IDENTITY_PROCESSING_TIMEOUT: "Identity check timeout",
};

export const COOKIES_PREFERENCES_SET = "cookies_preferences_set";

export const CONTACT_US_REFERER_ALLOWLIST = [
  "",
  "accountCreatedEmail",
  "confirmEmailAddressEmail",
  "passwordResetConfirmationEmail",
  "passwordResetConfirmationSms",
  "passwordResetRequestEmail",
  "emailAddressUpdatedEmail",
  "accountDeletedEmail",
  "phoneNumberUpdatedEmail",
  "passwordUpdatedEmail",
];
