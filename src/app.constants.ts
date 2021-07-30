export const PATH_NAMES = {
  ACCESSIBILITY_STATEMENT: "/accessibility-statement",
  TERMS_AND_CONDITIONS: "/terms-and-conditions",
  PRIVACY_POLICY: "/privacy-statement",
  COOKIES_POLICY: "/cookies",
  ENTER_EMAIL: "/enter-email",
  CHECK_YOUR_EMAIL: "/check-your-email",
  ENTER_PASSWORD: "/enter-password",
  CREATE_ACCOUNT_CHECK_EMAIL: "/check-email",
  CREATE_ACCOUNT_SET_PASSWORD: "/create-password",
  CREATE_ACCOUNT_ENTER_PHONE_NUMBER: "/enter-phone-number",
  CREATE_ACCOUNT_SUCCESSFUL: "/account-created",
  LOG_IN_ENTER_PHONE_NUMBER: "/enter-phone-number",
  CHECK_YOUR_PHONE: "/check-your-phone",
  ENTER_MFA: "/enter-code",
  SECURITY_CODE_EXPIRED: "/security-code-expired",
  AUTH_CODE: "/auth-code",
  RESEND_MFA_CODE: "/resend-code",
  SIGNED_OUT: "/signed-out",
};

export const HTTP_STATUS_CODES = {
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  OK: 200,
  REDIRECT: 303,
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

export const USER_STATE = {
  REQUIRES_TWO_FACTOR: "TWO_FACTOR_REQUIRED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  EMAIL_CODE_VERIFIED: "EMAIL_CODE_VERIFIED",
  AUTHENTICATED: "AUTHENTICATED",
  LOGGED_IN: "LOGGED_IN",
  ADDED_UNVERIFIED_PHONE_NUMBER: "ADDED_UNVERIFIED_PHONE_NUMBER",
  PHONE_NUMBER_VERIFIED: "PHONE_NUMBER_CODE_VERIFIED",
  MFA_CODE_VERIFIED: "MFA_CODE_VERIFIED",
  PHONE_NUMBER_CODE_MAX_RETRIES_REACHED:
    "PHONE_NUMBER_CODE_MAX_RETRIES_REACHED",
  MFA_CODE_SENT: "MFA_CODE_SENT",
};

export enum NOTIFICATION_TYPE {
  VERIFY_EMAIL = "VERIFY_EMAIL",
  VERIFY_PHONE_NUMBER = "VERIFY_PHONE_NUMBER",
  MFA_SMS = "MFA_SMS",
}

export const ENVIRONMENT_NAME = {
  PROD: "production",
  DEV: "development",
};
