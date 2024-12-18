import { ContentIdVariants } from "./types";

export enum MFA_METHOD_TYPE {
  SMS = "SMS",
  AUTH_APP = "AUTH_APP",
}

export const PATH_NAMES = {
  ROOT: "/",
  AUTHORIZE: "/authorize",
  ACCESSIBILITY_STATEMENT: "/accessibility-statement",
  ACCOUNT_INTERVENTIONS: "/account-interventions",
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
  RESET_PASSWORD_2FA_SMS: "/reset-password-2fa-sms",
  RESET_PASSWORD_REQUIRED: "/reset-password-required",
  RESET_PASSWORD_REQUEST: "/reset-password-request",
  RESET_PASSWORD_RESEND_CODE: "/reset-password-resend-code",
  CREATE_ACCOUNT_CHECK_EMAIL: "/check-email",
  CREATE_ACCOUNT_SET_PASSWORD: "/create-password",
  CREATE_ACCOUNT_ENTER_PHONE_NUMBER: "/enter-phone-number",
  CREATE_ACCOUNT_SUCCESSFUL: "/account-created",
  CHECK_YOUR_PHONE: "/check-your-phone",
  UPDATED_TERMS_AND_CONDITIONS: "/updated-terms-and-conditions",
  ENTER_MFA: "/enter-code",
  SECURITY_CODE_INVALID: "/security-code-invalid",
  SECURITY_CODE_REQUEST_EXCEEDED: "/security-code-requested-too-many-times",
  SECURITY_CODE_WAIT: "/security-code-invalid-request",
  SECURITY_CODE_CHECK_TIME_LIMIT: "/security-code-check-time-limit",
  AUTH_CODE: "/auth-code",
  RESEND_MFA_CODE: "/resend-code",
  RESEND_MFA_CODE_ACCOUNT_CREATION: "/resend-code-create-account",
  RESEND_EMAIL_CODE: "/resend-email-code",
  SIGNED_OUT: "/signed-out",
  ACCOUNT_LOCKED: "/account-locked",
  SIGN_IN_RETRY_BLOCKED: "/sign-in-retry-blocked",
  UPLIFT_JOURNEY: "/uplift",
  CONTACT_US: "/contact-us",
  CONTACT_US_FROM_TRIAGE_PAGE: "/contact-us-from-triage-page",
  CONTACT_US_SUBMIT_SUCCESS: "/contact-us-submit-success",
  CONTACT_US_FURTHER_INFORMATION: "/contact-us-further-information",
  CONTACT_US_QUESTIONS: "/contact-us-questions",
  PROVE_IDENTITY: "/prove-identity",
  DOC_CHECKING_APP: "/doc-checking-app",
  DOC_CHECKING_APP_CALLBACK: "/doc-app-callback",
  PROVE_IDENTITY_CALLBACK: "/ipv-callback",
  PROVE_IDENTITY_CALLBACK_SESSION_EXPIRY_ERROR:
    "/ipv-callback-session-expiry-error",
  PROVE_IDENTITY_CALLBACK_STATUS: "/prove-identity-status",
  HEALTHCHECK: "/healthcheck",
  PROVE_IDENTITY_WELCOME: "/prove-identity-welcome",
  GET_SECURITY_CODES: "/get-security-codes",
  ENTER_AUTHENTICATOR_APP_CODE: "/enter-authenticator-app-code",
  CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP: "/setup-authenticator-app",
  COOKIES_POLICY: "/cookies",
  ERROR_PAGE: "/error",
  SECURITY_CODE_ENTERED_EXCEEDED: "/security-code-entered-exceeded",
  CHANGE_SECURITY_CODES: "/change-security-codes",
  CANNOT_CHANGE_SECURITY_CODES: "/cannot-change-security-codes",
  CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL:
    "/cannot-change-security-codes-identity-fail",
  CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES: "/check-email-change-security-codes",
  CHANGE_SECURITY_CODES_CONFIRMATION: "/change-codes-confirmed",
  PASSWORD_RESET_REQUIRED: "/password-reset-required",
  UNAVAILABLE_PERMANENT: "/unavailable-permanent",
  UNAVAILABLE_TEMPORARY: "/unavailable-temporary",
  RESET_PASSWORD_2FA_AUTH_APP: "/reset-password-2fa-auth-app",
  MFA_RESET_WITH_IPV: "/mfa-reset-with-ipv",
  IPV_CALLBACK: "/ipv/callback/authorize",
};

export const CONTENT_IDS: {
  [path: string]: ContentIdVariants;
} = {
  [PATH_NAMES.ENTER_EMAIL_SIGN_IN]: {
    default: "d8767bcf-ffb8-4b43-8bda-24c6291590bb",
    reauth: "aff1628e-177d-4afc-825b-56e926b2fc1f",
  },
  [PATH_NAMES.ENTER_PASSWORD]: {
    default: "6b9f2243-d217-4c55-8ef3-7ac24b1f77e2",
    reauth: "c6f4fed1-ee6d-4d23-a14f-4466e9c1349c",
  },
  [PATH_NAMES.ENTER_MFA]: {
    default: "19601dd7-be55-4ab6-aa44-a6358c4239dc",
    reauth: "c9f09429-b29d-421e-a33a-41149489a0a2",
    upliftRequired: "",
  },
  [PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE]: {
    default: "89461417-df3f-46a8-9c37-713b9dd78085",
    reauth: "6e5cc49f-4770-4089-8547-06149e0f59b1",
    upliftRequired: "",
  },
  [PATH_NAMES.RESEND_MFA_CODE]: {
    default: "f463a280-31f1-43c0-a2f5-6b46b1e2bb15",
    reauth: "a2776ef7-9ef3-4d8d-bdbc-3f798b15e5d4",
  },
};

export const HREF_BACK = {
  CHECK_YOUR_PHONE: "check-your-phone",
  ENTER_AUTHENTICATOR_APP_CODE: "enter-authenticator-app-code",
  ENTER_MFA: "enter-code",
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

export enum LOCALE {
  EN = "en",
  CY = "cy",
}

export const API_ENDPOINTS = {
  ACCOUNT_INTERVENTIONS: "/account-interventions",
  USER_EXISTS: "/user-exists",
  SIGNUP_USER: "/signup",
  SEND_NOTIFICATION: "/send-notification",
  VERIFY_CODE: "/verify-code",
  LOG_IN_USER: "/login",
  UPDATE_PROFILE: "/update-profile",
  MFA: "/mfa",
  AUTH_CODE: "/auth-code",
  ORCH_AUTH_CODE: "/orch-auth-code",
  START: "/start",
  RESET_PASSWORD_REQUEST: "/reset-password-request",
  RESET_PASSWORD: "/reset-password",
  IPV_AUTHORIZE: "/ipv-authorize",
  DOC_CHECKING_APP_AUTHORIZE: "/doc-app-authorize",
  IPV_PROCESSING_IDENTITY: "/processing-identity",
  VERIFY_MFA_CODE: "/verify-mfa-code",
  ACCOUNT_RECOVERY: "/account-recovery",
  CHECK_REAUTH_USER: "/check-reauth-user",
  CHECK_EMAIL_FRAUD_BLOCK: "/check-email-fraud-block",
  MFA_RESET_AUTHORIZE: "/mfa-reset-authorize",
  REVERIFICATION_RESULT: "/reverification-result",
  ID_REVERIFICATION_STATE: "/id-reverification-state",
};

export const ERROR_MESSAGES = {
  FAILED_HTTP_REQUEST: "Failed HTTP request",
  INVALID_CSRF_TOKEN: "Invalid CSRF token",
  INVALID_SESSION_GOV_UK_INTERNAL_REQUEST:
    "Invalid session and referrer has gov.uk domain",
  INVALID_SESSION_NON_GOV_UK_EXTERNAL_REQUEST:
    "Invalid session and referrer does not have gov.uk domain",
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

export const CONTACT_US_THEMES = {
  ACCOUNT_CREATION: "account_creation",
  SIGNING_IN: "signing_in",
  SOMETHING_ELSE: "something_else",
  EMAIL_SUBSCRIPTIONS: "email_subscriptions",
  SUGGESTIONS_FEEDBACK: "suggestions_feedback",
  ACCOUNT_NOT_FOUND: "account_not_found",
  TECHNICAL_ERROR: "technical_error",
  NO_SECURITY_CODE: "no_security_code",
  INVALID_SECURITY_CODE: "invalid_security_code",
  SIGN_IN_PHONE_NUMBER_ISSUE: "sign_in_phone_number_issue",
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
  PROVING_IDENTITY_FACE_TO_FACE: "id_face_to_face",
  PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_ENTERING_DETAILS:
    "face_to_face_details",
  PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_LETTER: "face_to_face_letter",
  PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_AT_POST_OFFICE:
    "face_to_face_post_office",
  PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_FINDING_RESULT:
    "face_to_face_post_office_id_results",
  PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_CONTINUING:
    "face_to_face_post_office_service",
  PROVING_IDENTITY_FACE_TO_FACE_TECHNICAL_PROBLEM:
    "face_to_face_technical_problem",
  PROVING_IDENTITY_FACE_TO_FACE_ANOTHER_PROBLEM: "face_to_face_something_else",
  PROVING_IDENTITY_PROBLEM_ANSWERING_SECURITY_QUESTIONS:
    "proving_identity_problem_answering_security_questions",
  PROVING_IDENTITY_PROBLEM_WITH_IDENTITY_DOCUMENT:
    "proving_identity_problem_with_identity_document",
  PROVING_IDENTITY_PROBLEM_WITH_BANK_BUILDING_SOCIETY_DETAILS:
    "proving_identity_problem_with_bank_building_society_details",
  PROVING_IDENTITY_NEED_TO_UPDATE_PERSONAL_INFORMATION:
    "proving_identity_need_to_update_personal_information",
  PROVING_IDENTITY_SOMETHING_ELSE: "proving_identity_something_else",
  PROVING_IDENTITY_PROBLEM_WITH_NATIONAL_INSURANCE_NUMBER:
    "proving_identity_problem_with_national_insurance_number",
  PROVING_IDENTITY_PROBLEM_WITH_ADDRESS:
    "proving_identity_problem_with_address",
};

export const CONTACT_US_FIELD_MAX_LENGTH = 1200;
export const CONTACT_US_COUNTRY_MAX_LENGTH = 256;

export const PLACEHOLDER_REPLACEMENTS = [
  {
    search: "[maximumCharacters]",
    replacement: CONTACT_US_FIELD_MAX_LENGTH.toLocaleString(),
  },
  {
    search: "[maximumCountryCharacters]",
    replacement: CONTACT_US_COUNTRY_MAX_LENGTH.toLocaleString(),
  },
];

export enum NOTIFICATION_TYPE {
  VERIFY_EMAIL = "VERIFY_EMAIL",
  VERIFY_PHONE_NUMBER = "VERIFY_PHONE_NUMBER",
  ACCOUNT_CREATED_CONFIRMATION = "ACCOUNT_CREATED_CONFIRMATION",
  MFA_SMS = "MFA_SMS",
  RESET_PASSWORD_WITH_CODE = "RESET_PASSWORD_WITH_CODE",
  VERIFY_CHANGE_HOW_GET_SECURITY_CODES = "VERIFY_CHANGE_HOW_GET_SECURITY_CODES",
  CHANGE_HOW_GET_SECURITY_CODES_CONFIRMATION = "CHANGE_HOW_GET_SECURITY_CODES_CONFIRMATION",
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

export enum JOURNEY_TYPE {
  REGISTRATION = "REGISTRATION",
  ACCOUNT_RECOVERY = "ACCOUNT_RECOVERY",
  SIGN_IN = "SIGN_IN",
  PASSWORD_RESET_MFA = "PASSWORD_RESET_MFA",
  REAUTHENTICATION = "REAUTHENTICATION",
}

export enum CHANNEL {
  WEB = "web",
  STRATEGIC_APP = "strategic_app",
}

export const ENVIRONMENT_NAME = {
  PROD: "production",
  DEV: "development",
};

export const APP_ENV_NAME = {
  PROD: "production",
  INT: "integration",
  STAGING: "staging",
  BUILD: "build",
  DEV: "dev",
  SANDPIT: "sandpit",
  AUTHDEV1: "authdev1",
  AUTHDEV2: "authdev2",
  LOCAL: "local",
  TEST: "test",
};

export const LOWER_ENVIRONMENTS = [
  APP_ENV_NAME.BUILD,
  APP_ENV_NAME.DEV,
  APP_ENV_NAME.SANDPIT,
  APP_ENV_NAME.AUTHDEV1,
  APP_ENV_NAME.AUTHDEV2,
  APP_ENV_NAME.LOCAL,
  APP_ENV_NAME.TEST,
];

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
export const COOKIES_CHANNEL = "channel";

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
  "changeCodesConfirmEmail",
];

const GA_COOKIES = ["_ga", "_gid"];

const DYNATRACE_RUM_COOKIES = [
  "dtCookie",
  "dtLatC",
  "dtPC",
  "dtSa",
  "dtValidationCookie",
  "dtDisabled",
  "rxVisitor",
  "rxvt",
];
export const ANALYTICS_COOKIES = [...GA_COOKIES, ...DYNATRACE_RUM_COOKIES];

export const WEB_TO_MOBILE_TEMPLATE_MAPPINGS: Record<string, string> = {
  "sign-in-or-create/index.njk": "sign-in-or-create/index-mobile.njk",
  "account-not-found/index-one-login.njk": "account-not-found/index-mobile.njk",
  "account-not-found/index-optional.njk": "account-not-found/index-mobile.njk",
  "account-not-found/index-mandatory.njk": "account-not-found/index-mobile.njk",
};

export const WEB_TO_MOBILE_ERROR_MESSAGE_MAPPINGS: Record<string, string> = {
  "pages.reEnterEmailAccount.enterYourEmailAddressError":
    "mobileAppPages.reEnterEmailAccount.enterYourEmailAddressError",
};

export const CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION = {
  HELP_DELETE_ACCOUNT: "help-to-delete-account",
  RETRY_SECURITY_CODE: "retry-security-code",
};
