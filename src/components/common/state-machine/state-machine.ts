import type { EventType, StateValue } from "xstate";
import { createMachine } from "xstate";
import {
  MFA_METHOD_TYPE,
  OIDC_PROMPT,
  PATH_NAMES,
} from "../../../app.constants.js";

const USER_JOURNEY_EVENTS = {
  AUTHENTICATED: "AUTHENTICATED",
  CREDENTIALS_VALIDATED: "CREDENTIALS_VALIDATED",
  PHONE_NUMBER_VERIFIED: "PHONE_NUMBER_CODE_VERIFIED",
  MFA_CODE_VERIFIED: "MFA_CODE_VERIFIED",
  EMAIL_CODE_VERIFIED: "EMAIL_CODE_VERIFIED",
  CONSENT_ACCEPTED: "CONSENT_ACCEPTED",
  TERMS_AND_CONDITIONS_ACCEPTED: "TERMS_AND_CONDITIONS_ACCEPTED",
  VERIFY_PHONE_NUMBER: "VERIFY_PHONE_NUMBER",
  VERIFY_EMAIL_CODE: "VERIFY_EMAIL_CODE",
  ACCOUNT_CREATED: "ACCOUNT_CREATED",
  START: "START",
  EXISTING_SESSION: "EXISTING_SESSION",
  NO_EXISTING_SESSION: "NO_EXISTING_SESSION",
  VERIFY_MFA: "VERIFY_MFA",
  PROVE_IDENTITY_CALLBACK: "PROVE_IDENTITY_CALLBACK",
  PROVE_IDENTITY_CALLBACK_STATUS: "PROVE_IDENTITY_CALLBACK_STATUS",
  DOC_CHECKING_AUTH_REDIRECT: "DOC_CHECKING_AUTH_REDIRECT",
  DOC_CHECKING_AUTH_CALLBACK: "DOC_CHECKING_AUTH_CALLBACK",
  IDENTITY_CHECKED: "IDENTITY_CHECKED",
  CREATE_ACCOUNT: "CREATE_ACCOUNT",
  ENTER_EMAIL: "ENTER_EMAIL",
  TERMS_AND_CONDITIONS_UPDATED: "TERMS_AND_CONDITIONS_UPDATED",
  VALIDATE_CREDENTIALS: "VALIDATE_CREDENTIALS",
  ACCOUNT_NOT_FOUND: "ACCOUNT_NOT_FOUND",
  ACCOUNT_FOUND_CREATE: "ACCOUNT_FOUND_CREATE",
  ACCOUNT_FOUND: "ACCOUNT_FOUND",
  CREATE_OR_SIGN_IN: "CREATE_OR_SIGN_IN",
  SIGN_IN: "SIGN_IN",
  CREATE_NEW_ACCOUNT: "CREATE_NEW_ACCOUNT",
  SEND_EMAIL_CODE: "SEND_EMAIL_CODE",
  PASSWORD_CREATED: "PASSWORD_CREATED",
  REQUEST_PASSWORD_RESET: "REQUEST_PASSWORD_RESET",
  PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED",
  PASSWORD_RESET_RESEND_CODE: "PASSWORD_RESET_RESEND_CODE",
  RESEND_MFA: "RESEND_MFA",
  RESET_PASSWORD_CODE_VERIFIED: "RESET_PASSWORD_CODE_VERIFIED",
  MFA_OPTION_AUTH_APP_SELECTED: "MFA_OPTION_AUTH_APP_SELECTED",
  MFA_OPTION_SMS_SELECTED: "MFA_OPTION_SMS_SELECTED",
  VERIFY_AUTH_APP_CODE: "VERIFY_AUTH_APP_CODE",
  AUTH_APP_CODE_VERIFIED: "AUTH_APP_CODE_VERIFIED",
  CHANGE_SECURITY_CODES_COMPLETED: "CHANGE_SECURITY_CODES_COMPLETED",
  TEMPORARILY_BLOCKED_INTERVENTION: "TEMP_SUSPENSION_INTERVENTION",
  PERMANENTLY_BLOCKED_INTERVENTION: "PERMANENTLY_BLOCKED_INTERVENTION",
  PASSWORD_RESET_INTERVENTION: "PASSWORD_RESET_INTERVENTION",
  COMMON_PASSWORD_AND_AIS_STATUS: "COMMON_PASSWORD_AND_AIS_STATUS",
  IPV_REVERIFICATION_INIT: "IPV_REVERIFICATION_INIT",
  IPV_REVERIFICATION_COMPLETED: "IPV_REVERIFICATION_COMPLETED",
  IPV_REVERIFICATION_INCOMPLETE_OR_UNAVAILABLE:
    "IPV_REVERIFICATION_INCOMPLETE_OR_UNAVAILABLE",
  IPV_REVERIFICATION_FAILED_OR_DID_NOT_MATCH:
    "IPV_REVERIFICATION_FAILED_OR_DID_NOT_MATCH",
  MFA_RESET_ATTEMPTED_VIA_AUTH_APP: "MFA_RESET_ATTEMPTED_VIA_AUTH_APP",
};

const authStateMachine = createMachine(
  {
    id: "AUTH",
    initial: PATH_NAMES.AUTHORIZE,
    context: {
      isLatestTermsAndConditionsAccepted: true,
      requiresUplift: false,
      requiresTwoFactorAuth: false,
      isAuthenticated: false,
      isIdentityRequired: false,
      prompt: OIDC_PROMPT.NONE,
      skipAuthentication: false,
      mfaMethodType: MFA_METHOD_TYPE.SMS,
      isMfaMethodVerified: true,
      isPasswordChangeRequired: false,
      isAccountRecoveryJourney: false,
      isReauthenticationRequired: false,
      requiresResetPasswordMFASmsCode: false,
      requiresResetPasswordMFAAuthAppCode: false,
      isOnForcedPasswordResetJourney: false,
    },
    states: {
      [PATH_NAMES.AUTHORIZE]: {
        on: {
          [USER_JOURNEY_EVENTS.EXISTING_SESSION]: [
            { target: [PATH_NAMES.ENTER_PASSWORD], cond: "requiresLogin" },
            {
              target: [PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE],
              cond: "requiresAuthAppUplift",
            },
            { target: [PATH_NAMES.UPLIFT_JOURNEY], cond: "requiresUplift" },
            {
              target: [PATH_NAMES.ENTER_EMAIL_SIGN_IN],
              cond: "isReauthenticationRequired",
            },
            {
              target: [PATH_NAMES.AUTH_CODE],
              cond: "isIdentityRequired",
            },
            { target: [PATH_NAMES.AUTH_CODE], cond: "isAuthenticated" },
          ],
          [USER_JOURNEY_EVENTS.NO_EXISTING_SESSION]: [
            {
              target: [PATH_NAMES.ENTER_EMAIL_SIGN_IN],
              cond: "isReauthenticationRequired",
            },
            {
              target: [PATH_NAMES.DOC_CHECKING_APP],
              cond: "skipAuthentication",
            },
            { target: [PATH_NAMES.SIGN_IN_OR_CREATE] },
          ],
        },
      },
      [PATH_NAMES.SIGN_IN_OR_CREATE]: {
        on: {
          [USER_JOURNEY_EVENTS.SIGN_IN]: [PATH_NAMES.ENTER_EMAIL_SIGN_IN],
          [USER_JOURNEY_EVENTS.CREATE_NEW_ACCOUNT]: [
            PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT,
          ],
        },
        meta: {
          optionalPaths: [PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT_REQUEST],
        },
      },
      [PATH_NAMES.ENTER_EMAIL_SIGN_IN]: {
        on: {
          [USER_JOURNEY_EVENTS.VALIDATE_CREDENTIALS]: [
            PATH_NAMES.ENTER_PASSWORD,
          ],
          [USER_JOURNEY_EVENTS.ACCOUNT_NOT_FOUND]: [
            PATH_NAMES.ACCOUNT_NOT_FOUND,
          ],
        },
        meta: {
          optionalPaths: [
            PATH_NAMES.SIGN_IN_OR_CREATE,
            PATH_NAMES.ACCOUNT_LOCKED,
          ],
        },
      },
      [PATH_NAMES.ACCOUNT_NOT_FOUND]: {
        on: {
          [USER_JOURNEY_EVENTS.SEND_EMAIL_CODE]: [PATH_NAMES.CHECK_YOUR_EMAIL],
        },
        meta: {
          optionalPaths: [
            PATH_NAMES.ENTER_EMAIL_SIGN_IN,
            PATH_NAMES.SIGN_IN_OR_CREATE,
            PATH_NAMES.SECURITY_CODE_WAIT,
            PATH_NAMES.SECURITY_CODE_INVALID,
            PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED,
          ],
        },
      },
      [PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT]: {
        on: {
          [USER_JOURNEY_EVENTS.ACCOUNT_FOUND_CREATE]: [
            PATH_NAMES.ENTER_PASSWORD_ACCOUNT_EXISTS,
          ],
          [USER_JOURNEY_EVENTS.SEND_EMAIL_CODE]: [PATH_NAMES.CHECK_YOUR_EMAIL],
        },
        meta: {
          optionalPaths: [PATH_NAMES.SIGN_IN_OR_CREATE],
        },
      },
      [PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT_REQUEST]: {
        on: {
          [USER_JOURNEY_EVENTS.CREATE_NEW_ACCOUNT]: [
            PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT,
          ],
        },
      },
      [PATH_NAMES.RESEND_EMAIL_CODE]: {
        on: {
          [USER_JOURNEY_EVENTS.SEND_EMAIL_CODE]: [
            {
              target: [PATH_NAMES.CHECK_YOUR_EMAIL],
            },
          ],
        },
      },
      [PATH_NAMES.ENTER_PASSWORD_ACCOUNT_EXISTS]: {
        on: {
          [USER_JOURNEY_EVENTS.COMMON_PASSWORD_AND_AIS_STATUS]: [
            PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL,
          ],
          [USER_JOURNEY_EVENTS.CREDENTIALS_VALIDATED]: [
            {
              target: [PATH_NAMES.RESET_PASSWORD_REQUIRED],
              cond: "isPasswordChangeRequired",
            },
            {
              target: [PATH_NAMES.GET_SECURITY_CODES],
              cond: "isAccountPartCreated",
            },
            {
              target: [PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE],
              cond: "requiresMFAAuthAppCode",
            },
            { target: [PATH_NAMES.ENTER_MFA], cond: "requiresTwoFactorAuth" },
            {
              target: [PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS],
              cond: "isLatestTermsAndConditionsAccepted",
            },
            { target: [PATH_NAMES.AUTH_CODE] },
          ],
        },
        meta: {
          optionalPaths: [
            PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT,
            PATH_NAMES.ACCOUNT_LOCKED,
            PATH_NAMES.SIGN_IN_OR_CREATE,
            PATH_NAMES.RESET_PASSWORD_REQUEST,
          ],
        },
      },
      [PATH_NAMES.CHECK_YOUR_EMAIL]: {
        on: {
          [USER_JOURNEY_EVENTS.EMAIL_CODE_VERIFIED]: [
            PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD,
          ],
        },
        meta: {
          optionalPaths: [
            PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT,
            PATH_NAMES.RESEND_EMAIL_CODE,
            PATH_NAMES.SECURITY_CODE_WAIT,
            PATH_NAMES.SECURITY_CODE_INVALID,
            PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED,
            PATH_NAMES.SIGN_IN_OR_CREATE,
          ],
        },
      },
      [PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD]: {
        on: {
          [USER_JOURNEY_EVENTS.PASSWORD_CREATED]: [
            {
              target: [PATH_NAMES.GET_SECURITY_CODES],
            },
          ],
        },
      },
      [PATH_NAMES.GET_SECURITY_CODES]: {
        on: {
          [USER_JOURNEY_EVENTS.MFA_OPTION_SMS_SELECTED]: [
            PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
          ],
          [USER_JOURNEY_EVENTS.MFA_OPTION_AUTH_APP_SELECTED]: [
            PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP,
          ],
        },
      },
      [PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP]: {
        on: {
          [USER_JOURNEY_EVENTS.MFA_CODE_VERIFIED]: [
            {
              target: [PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION],
              cond: "isAccountRecoveryJourney",
            },
            {
              target: [PATH_NAMES.AUTH_CODE],
              cond: "isIdentityRequired",
            },
            { target: [PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL] },
          ],
        },
        meta: {
          optionalPaths: [PATH_NAMES.GET_SECURITY_CODES],
        },
      },
      [PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER]: {
        on: {
          [USER_JOURNEY_EVENTS.VERIFY_PHONE_NUMBER]: [
            PATH_NAMES.CHECK_YOUR_PHONE,
          ],
        },
        meta: {
          optionalPaths: [
            PATH_NAMES.SECURITY_CODE_WAIT,
            PATH_NAMES.SECURITY_CODE_INVALID,
            PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED,
            PATH_NAMES.GET_SECURITY_CODES,
          ],
        },
      },
      [PATH_NAMES.CHECK_YOUR_PHONE]: {
        on: {
          [USER_JOURNEY_EVENTS.PHONE_NUMBER_VERIFIED]: [
            {
              target: [PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION],
              cond: "isAccountRecoveryJourney",
            },
            {
              target: [PATH_NAMES.AUTH_CODE],
              cond: "isIdentityRequired",
            },
            { target: [PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL] },
          ],
        },
        meta: {
          optionalPaths: [
            PATH_NAMES.SECURITY_CODE_WAIT,
            PATH_NAMES.SECURITY_CODE_INVALID,
            PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED,
            PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
            PATH_NAMES.RESEND_MFA_CODE,
            PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION,
            PATH_NAMES.GET_SECURITY_CODES,
          ],
        },
      },
      [PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL]: {
        on: {
          [USER_JOURNEY_EVENTS.ACCOUNT_CREATED]: [
            { target: [PATH_NAMES.AUTH_CODE] },
          ],
        },
      },
      [PATH_NAMES.ENTER_PASSWORD]: {
        on: {
          [USER_JOURNEY_EVENTS.COMMON_PASSWORD_AND_AIS_STATUS]: [
            PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL,
          ],
          [USER_JOURNEY_EVENTS.CREDENTIALS_VALIDATED]: [
            {
              target: [PATH_NAMES.RESET_PASSWORD_2FA_SMS],
              cond: "is2FASMSPasswordChangeRequired",
            },
            {
              target: [PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP],
              cond: "is2FAAuthAppPasswordChangeRequired",
            },
            {
              target: [PATH_NAMES.RESET_PASSWORD_REQUIRED],
              cond: "isPasswordChangeRequired",
            },
            {
              target: [PATH_NAMES.GET_SECURITY_CODES],
              cond: "isAccountPartCreated",
            },
            {
              target: [PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE],
              cond: "requiresMFAAuthAppCode",
            },
            { target: [PATH_NAMES.ENTER_MFA], cond: "requiresTwoFactorAuth" },
            {
              target: [PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS],
              cond: "isLatestTermsAndConditionsAccepted",
            },
            { target: [PATH_NAMES.AUTH_CODE] },
          ],
        },
        meta: {
          optionalPaths: [
            PATH_NAMES.ENTER_EMAIL_SIGN_IN,
            PATH_NAMES.ACCOUNT_LOCKED,
            PATH_NAMES.SIGN_IN_OR_CREATE,
            PATH_NAMES.RESET_PASSWORD_REQUEST,
            PATH_NAMES.SIGN_IN_RETRY_BLOCKED,
          ],
        },
      },
      [PATH_NAMES.ENTER_MFA]: {
        on: {
          [USER_JOURNEY_EVENTS.MFA_CODE_VERIFIED]: [
            {
              target: [PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS],
              cond: "isLatestTermsAndConditionsAccepted",
            },
            {
              target: [PATH_NAMES.AUTH_CODE],
              cond: "isIdentityRequired",
            },
            { target: [PATH_NAMES.AUTH_CODE] },
          ],
        },
        meta: {
          optionalPaths: [
            PATH_NAMES.RESEND_MFA_CODE,
            PATH_NAMES.SECURITY_CODE_WAIT,
            PATH_NAMES.SECURITY_CODE_INVALID,
            PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED,
            PATH_NAMES.MFA_RESET_WITH_IPV,
            PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES,
            PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL,
            PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES,
          ],
        },
      },
      [PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE]: {
        on: {
          [USER_JOURNEY_EVENTS.AUTH_APP_CODE_VERIFIED]: [
            {
              target: [PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS],
              cond: "isLatestTermsAndConditionsAccepted",
            },
            {
              target: [PATH_NAMES.AUTH_CODE],
              cond: "isIdentityRequired",
            },
            { target: [PATH_NAMES.AUTH_CODE] },
          ],
        },
        meta: {
          optionalPaths: [
            PATH_NAMES.SECURITY_CODE_INVALID,
            PATH_NAMES.CHECK_YOUR_EMAIL,
            PATH_NAMES.MFA_RESET_WITH_IPV,
            PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES,
            PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL,
            PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES,
          ],
        },
      },
      [PATH_NAMES.UPLIFT_JOURNEY]: {
        on: {
          [USER_JOURNEY_EVENTS.VERIFY_MFA]: [PATH_NAMES.ENTER_MFA],
        },
      },
      [PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS]: {
        on: {
          [USER_JOURNEY_EVENTS.TERMS_AND_CONDITIONS_ACCEPTED]: [
            {
              target: [PATH_NAMES.AUTH_CODE],
              cond: "isIdentityRequired",
            },
            { target: [PATH_NAMES.AUTH_CODE] },
          ],
        },
      },
      [PATH_NAMES.RESET_PASSWORD_REQUEST]: {
        on: {
          [USER_JOURNEY_EVENTS.PASSWORD_RESET_REQUESTED]: [
            PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL,
          ],
        },
      },
      [PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL]: {
        on: {
          [USER_JOURNEY_EVENTS.PASSWORD_RESET_INTERVENTION]: [
            PATH_NAMES.PASSWORD_RESET_REQUIRED,
          ],
          [USER_JOURNEY_EVENTS.RESET_PASSWORD_CODE_VERIFIED]: [
            {
              target: [PATH_NAMES.RESET_PASSWORD_2FA_SMS],
              cond: "requiresResetPasswordMFASmsCode",
            },
            {
              target: [PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP],
              cond: "requiresResetPasswordMFAAuthAppCode",
            },
            {
              target: [PATH_NAMES.RESET_PASSWORD],
            },
          ],
        },
        meta: {
          optionalPaths: [
            PATH_NAMES.ENTER_PASSWORD,
            PATH_NAMES.RESET_PASSWORD_RESEND_CODE,
          ],
        },
      },
      [PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP]: {
        on: {
          [USER_JOURNEY_EVENTS.MFA_CODE_VERIFIED]: [
            {
              target: [PATH_NAMES.RESET_PASSWORD_REQUIRED],
              cond: "isPasswordChangeRequired",
            },
            {
              target: [PATH_NAMES.RESET_PASSWORD],
            },
          ],
        },
      },
      [PATH_NAMES.RESET_PASSWORD_2FA_SMS]: {
        on: {
          [USER_JOURNEY_EVENTS.PERMANENTLY_BLOCKED_INTERVENTION]: [
            PATH_NAMES.UNAVAILABLE_PERMANENT,
          ],
          [USER_JOURNEY_EVENTS.TEMPORARILY_BLOCKED_INTERVENTION]: [
            PATH_NAMES.UNAVAILABLE_TEMPORARY,
          ],
          [USER_JOURNEY_EVENTS.MFA_CODE_VERIFIED]: [
            {
              target: [PATH_NAMES.RESET_PASSWORD_REQUIRED],
              cond: "isPasswordChangeRequired",
            },
            {
              target: [PATH_NAMES.RESET_PASSWORD],
            },
          ],
        },
        meta: {
          optionalPaths: [PATH_NAMES.RESEND_MFA_CODE],
        },
      },
      [PATH_NAMES.RESET_PASSWORD_RESEND_CODE]: {
        on: {
          [USER_JOURNEY_EVENTS.PASSWORD_RESET_REQUESTED]: [
            PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL,
          ],
        },
      },
      [PATH_NAMES.RESET_PASSWORD]: {
        on: {
          [USER_JOURNEY_EVENTS.PERMANENTLY_BLOCKED_INTERVENTION]: [
            PATH_NAMES.UNAVAILABLE_PERMANENT,
          ],
          [USER_JOURNEY_EVENTS.TEMPORARILY_BLOCKED_INTERVENTION]: [
            PATH_NAMES.UNAVAILABLE_TEMPORARY,
          ],
          [USER_JOURNEY_EVENTS.PASSWORD_CREATED]: [
            {
              target: [PATH_NAMES.GET_SECURITY_CODES],
              cond: "isAccountPartCreated",
            },
            {
              target: [PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE],
              cond: "requiresMFAAuthAppCode",
            },
            { target: [PATH_NAMES.ENTER_MFA], cond: "requiresTwoFactorAuth" },
            {
              target: [PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS],
              cond: "isLatestTermsAndConditionsAccepted",
            },
            {
              target: [PATH_NAMES.AUTH_CODE],
              cond: "isIdentityRequired",
            },
            { target: [PATH_NAMES.AUTH_CODE] },
          ],
        },
        [PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER]: {
          on: {
            [USER_JOURNEY_EVENTS.VERIFY_PHONE_NUMBER]: [
              PATH_NAMES.CHECK_YOUR_PHONE,
            ],
          },
          meta: {
            optionalPaths: [
              PATH_NAMES.SECURITY_CODE_WAIT,
              PATH_NAMES.SECURITY_CODE_INVALID,
              PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED,
            ],
          },
        },
        meta: {
          optionalPaths: [
            PATH_NAMES.ENTER_EMAIL_SIGN_IN,
            PATH_NAMES.ACCOUNT_LOCKED,
            PATH_NAMES.SIGN_IN_OR_CREATE,
          ],
        },
      },
      [PATH_NAMES.RESET_PASSWORD_REQUIRED]: {
        on: {
          [USER_JOURNEY_EVENTS.PASSWORD_CREATED]: [
            {
              target: [PATH_NAMES.GET_SECURITY_CODES],
              cond: "isAccountPartCreated",
            },
            {
              target: [PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE],
              cond: "requiresMFAAuthAppCode",
            },
            { target: [PATH_NAMES.ENTER_MFA], cond: "requiresTwoFactorAuth" },
            {
              target: [PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS],
              cond: "isLatestTermsAndConditionsAccepted",
            },
            { target: [PATH_NAMES.AUTH_CODE] },
          ],
        },
        [PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER]: {
          on: {
            [USER_JOURNEY_EVENTS.VERIFY_PHONE_NUMBER]: [
              PATH_NAMES.CHECK_YOUR_PHONE,
            ],
          },
          meta: {
            optionalPaths: [
              PATH_NAMES.SECURITY_CODE_WAIT,
              PATH_NAMES.SECURITY_CODE_INVALID,
              PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED,
            ],
          },
        },
        meta: {
          optionalPaths: [
            PATH_NAMES.ENTER_EMAIL_SIGN_IN,
            PATH_NAMES.ACCOUNT_LOCKED,
            PATH_NAMES.SIGN_IN_OR_CREATE,
          ],
        },
      },
      [PATH_NAMES.PROVE_IDENTITY_CALLBACK]: {
        type: "final",
        meta: {
          optionalPaths: [
            PATH_NAMES.AUTH_CODE,
            PATH_NAMES.PROVE_IDENTITY_CALLBACK_STATUS,
          ],
        },
      },
      [PATH_NAMES.DOC_CHECKING_APP]: {
        on: {
          [USER_JOURNEY_EVENTS.DOC_CHECKING_AUTH_REDIRECT]: [
            PATH_NAMES.DOC_CHECKING_APP_CALLBACK,
          ],
        },
      },
      [PATH_NAMES.DOC_CHECKING_APP_CALLBACK]: {
        on: {
          [USER_JOURNEY_EVENTS.DOC_CHECKING_AUTH_CALLBACK]: [
            PATH_NAMES.AUTH_CODE,
          ],
        },
        meta: {
          optionalPaths: [PATH_NAMES.DOC_CHECKING_APP],
        },
      },
      [PATH_NAMES.AUTH_CODE]: {
        on: {
          [USER_JOURNEY_EVENTS.PASSWORD_RESET_INTERVENTION]: [
            PATH_NAMES.PASSWORD_RESET_REQUIRED,
          ],
          [USER_JOURNEY_EVENTS.PERMANENTLY_BLOCKED_INTERVENTION]: [
            PATH_NAMES.UNAVAILABLE_PERMANENT,
          ],
          [USER_JOURNEY_EVENTS.TEMPORARILY_BLOCKED_INTERVENTION]: [
            PATH_NAMES.UNAVAILABLE_TEMPORARY,
          ],
        },
        meta: {
          optionalPaths: [PATH_NAMES.PROVE_IDENTITY_CALLBACK],
        },
      },
      [PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT]: {
        on: {
          [USER_JOURNEY_EVENTS.SEND_EMAIL_CODE]: [PATH_NAMES.RESEND_EMAIL_CODE],
        },
      },
      [PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION]: {
        on: {
          [USER_JOURNEY_EVENTS.CHANGE_SECURITY_CODES_COMPLETED]: [
            { target: [PATH_NAMES.AUTH_CODE] },
          ],
        },
      },
      [PATH_NAMES.PASSWORD_RESET_REQUIRED]: {
        meta: {
          optionalPaths: [PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL],
        },
      },
      [PATH_NAMES.UNAVAILABLE_PERMANENT]: {
        type: "final",
      },
      [PATH_NAMES.UNAVAILABLE_TEMPORARY]: {
        type: "final",
      },
      [PATH_NAMES.MFA_RESET_WITH_IPV]: {
        on: {
          [USER_JOURNEY_EVENTS.IPV_REVERIFICATION_INIT]: [
            { target: [PATH_NAMES.IPV_CALLBACK] },
          ],
          [USER_JOURNEY_EVENTS.MFA_RESET_ATTEMPTED_VIA_AUTH_APP]: [
            { target: [PATH_NAMES.OPEN_IN_WEB_BROWSER] },
          ],
        },
      },
      [PATH_NAMES.OPEN_IN_WEB_BROWSER]: {
        type: "final",
        meta: {
          optionalPaths: [
            PATH_NAMES.ENTER_MFA,
            PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
          ],
        },
      },
      [PATH_NAMES.IPV_CALLBACK]: {
        on: {
          [USER_JOURNEY_EVENTS.IPV_REVERIFICATION_COMPLETED]: [
            {
              target: [PATH_NAMES.GET_SECURITY_CODES],
            },
          ],
          [USER_JOURNEY_EVENTS.IPV_REVERIFICATION_INCOMPLETE_OR_UNAVAILABLE]: [
            {
              target: [PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES],
            },
          ],
          [USER_JOURNEY_EVENTS.IPV_REVERIFICATION_FAILED_OR_DID_NOT_MATCH]: [
            {
              target: [PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL],
            },
          ],
        },
        meta: {
          optionalPaths: [
            PATH_NAMES.MFA_RESET_WITH_IPV,
            PATH_NAMES.ENTER_MFA,
            PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
          ],
        },
      },
      [PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES]: {
        on: {
          [USER_JOURNEY_EVENTS.VERIFY_MFA]: [PATH_NAMES.ENTER_MFA],
          [USER_JOURNEY_EVENTS.VERIFY_AUTH_APP_CODE]: [
            PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
          ],
        },
      },
      [PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL]: {
        on: {
          [USER_JOURNEY_EVENTS.VERIFY_MFA]: [PATH_NAMES.ENTER_MFA],
          [USER_JOURNEY_EVENTS.VERIFY_AUTH_APP_CODE]: [
            PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
          ],
        },
      },
    },
  },
  {
    guards: {
      isLatestTermsAndConditionsAccepted: (context) =>
        context.isLatestTermsAndConditionsAccepted === false,
      requiresUplift: (context) =>
        context.requiresUplift === true && context.isAuthenticated === true,
      isReauthenticationRequired: (context) =>
        context.isReauthenticationRequired,
      requiresAuthAppUplift: (context) =>
        context.requiresUplift === true &&
        context.isAuthenticated === true &&
        context.mfaMethodType === MFA_METHOD_TYPE.AUTH_APP,
      requiresTwoFactorAuth: (context) =>
        context.requiresTwoFactorAuth === true,
      isAccountPartCreated: (context) => context.isMfaMethodVerified === false,
      isIdentityRequired: (context) => context.isIdentityRequired === true,
      isAuthenticated: (context) => context.isAuthenticated === true,
      requiresLogin: (context) =>
        context.isAuthenticated === true &&
        context.prompt === OIDC_PROMPT.LOGIN,
      skipAuthentication: (context) =>
        context.skipAuthentication === true &&
        context.isAuthenticated === false,
      requiresMFAAuthAppCode: (context) =>
        context.mfaMethodType === MFA_METHOD_TYPE.AUTH_APP &&
        context.requiresTwoFactorAuth === true,
      requiresResetPasswordMFAAuthAppCode: (context) =>
        context.mfaMethodType === MFA_METHOD_TYPE.AUTH_APP &&
        context.isOnForcedPasswordResetJourney !== true,
      requiresResetPasswordMFASmsCode: (context) =>
        context.mfaMethodType === MFA_METHOD_TYPE.SMS &&
        context.isOnForcedPasswordResetJourney !== true,
      isPasswordChangeRequired: (context) => context.isPasswordChangeRequired,
      is2FASMSPasswordChangeRequired: (context) =>
        context.isPasswordChangeRequired === true &&
        context.mfaMethodType === MFA_METHOD_TYPE.SMS &&
        context.requiresTwoFactorAuth === true,
      is2FAAuthAppPasswordChangeRequired: (context) =>
        context.isPasswordChangeRequired === true &&
        context.mfaMethodType === MFA_METHOD_TYPE.AUTH_APP &&
        context.requiresTwoFactorAuth === true,
      isAccountRecoveryJourney: (context) => context.isAccountRecoveryJourney,
    },
  }
);

function getNextState(
  from: StateValue,
  to: any,
  ctx?: any
): { value: string; events: EventType[]; meta: any } {
  const t = authStateMachine.transition(from, to, ctx);
  return {
    value: t.value as string,
    events: t.nextEvents,
    meta: t.meta,
  };
}

export { getNextState, USER_JOURNEY_EVENTS, authStateMachine };
