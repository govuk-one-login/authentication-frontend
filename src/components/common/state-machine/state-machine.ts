import { createMachine, EventType, StateValue } from "xstate";
import { OIDC_PROMPT, PATH_NAMES } from "../../../app.constants";

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
  VERIFY_MFA: "VERIFY_MFA",
  PROVE_IDENTITY: "PROVE_IDENTITY",
  PROVE_IDENTITY_CALLBACK: "PROVE_IDENTITY_CALLBACK",
  PROVE_IDENTITY_INIT: "PROVE_IDENTITY_INIT",
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
  LANDING: "LANDING",
  PASSWORD_CREATED: "PASSWORD_CREATED",
  REQUEST_PASSWORD_RESET: "REQUEST_PASSWORD_RESET",
  PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED",
  PASSWORD_RESET_RESEND_CODE: "PASSWORD_RESET_RESEND_CODE",
  RESEND_MFA: "RESEND_MFA",
  RESET_PASSWORD_CODE_VERIFIED: "RESET_PASSWORD_CODE_VERIFIED",
  MFA_OPTION_AUTH_APP_SELECTED: "MFA_OPTION_AUTH_APP_SELECTED",
  MFA_OPTION_SMS_SELECTED: "MFA_OPTION_SMS_SELECTED",
};

const authStateMachine = createMachine(
  {
    id: "AUTH",
    initial: PATH_NAMES.START,
    context: {
      isLatestTermsAndConditionsAccepted: true,
      isConsentRequired: false,
      requiresUplift: false,
      requiresTwoFactorAuth: false,
      isPhoneNumberVerified: true,
      isAuthenticated: false,
      isIdentityRequired: false,
      prompt: OIDC_PROMPT.NONE,
      skipAuthentication: false,
      supportMFAOptions: false,
    },
    states: {
      [PATH_NAMES.START]: {
        on: {
          [USER_JOURNEY_EVENTS.EXISTING_SESSION]: [
            {
              target: [PATH_NAMES.PROVE_IDENTITY_WELCOME],
              cond: "isIdentityRequired",
            },
            { target: [PATH_NAMES.ENTER_PASSWORD], cond: "requiresLogin" },
            { target: [PATH_NAMES.UPLIFT_JOURNEY], cond: "requiresUplift" },
            {
              target: [PATH_NAMES.SHARE_INFO],
              cond: "isConsentRequired",
            },
            { target: [PATH_NAMES.AUTH_CODE], cond: "isAuthenticated" },
          ],
          [USER_JOURNEY_EVENTS.LANDING]: [
            {
              target: [PATH_NAMES.DOC_CHECKING_APP],
              cond: "skipAuthentication",
            },
            {
              target: [PATH_NAMES.PROVE_IDENTITY_WELCOME],
              cond: "isIdentityRequired",
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
      },
      [PATH_NAMES.PROVE_IDENTITY_WELCOME]: {
        on: {
          [USER_JOURNEY_EVENTS.EXISTING_SESSION]: [
            {
              target: [PATH_NAMES.ENTER_PASSWORD],
              cond: "requiresLogin",
            },
            { target: [PATH_NAMES.UPLIFT_JOURNEY], cond: "requiresUplift" },
            { target: [PATH_NAMES.PROVE_IDENTITY] },
          ],
          [USER_JOURNEY_EVENTS.CREATE_OR_SIGN_IN]: [
            PATH_NAMES.SIGN_IN_OR_CREATE,
          ],
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
          optionalPaths: [PATH_NAMES.SIGN_IN_OR_CREATE],
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
      [PATH_NAMES.ENTER_PASSWORD_ACCOUNT_EXISTS]: {
        on: {
          [USER_JOURNEY_EVENTS.CREDENTIALS_VALIDATED]: [
            {
              target: [PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER],
              cond: "isPhoneNumberVerified",
            },
            { target: [PATH_NAMES.ENTER_MFA], cond: "requiresTwoFactorAuth" },
            {
              target: [PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS],
              cond: "isLatestTermsAndConditionsAccepted",
            },
            {
              target: [PATH_NAMES.SHARE_INFO],
              cond: "isConsentRequired",
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
              cond: "supportMFAOptions",
            },
            {
              target: [PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER],
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
              target: [PATH_NAMES.PROVE_IDENTITY],
              cond: "isIdentityRequired",
            },
            { target: [PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL] },
          ],
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
          ],
        },
      },
      [PATH_NAMES.CHECK_YOUR_PHONE]: {
        on: {
          [USER_JOURNEY_EVENTS.PHONE_NUMBER_VERIFIED]: [
            {
              target: [PATH_NAMES.PROVE_IDENTITY],
              cond: "isIdentityRequired",
            },
            {
              target: [PATH_NAMES.SHARE_INFO],
              cond: "isConsentRequired",
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
          ],
        },
      },
      [PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL]: {
        on: {
          [USER_JOURNEY_EVENTS.ACCOUNT_CREATED]: [
            {
              target: [PATH_NAMES.SHARE_INFO],
              cond: "isConsentRequired",
            },
            { target: [PATH_NAMES.AUTH_CODE] },
          ],
        },
      },
      [PATH_NAMES.ENTER_PASSWORD]: {
        on: {
          [USER_JOURNEY_EVENTS.CREDENTIALS_VALIDATED]: [
            {
              target: [PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER],
              cond: "isPhoneNumberVerified",
            },
            { target: [PATH_NAMES.ENTER_MFA], cond: "requiresTwoFactorAuth" },
            {
              target: [PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS],
              cond: "isLatestTermsAndConditionsAccepted",
            },
            {
              target: [PATH_NAMES.SHARE_INFO],
              cond: "isConsentRequired",
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
              target: [PATH_NAMES.PROVE_IDENTITY],
              cond: "isIdentityRequired",
            },
            {
              target: [PATH_NAMES.SHARE_INFO],
              cond: "isConsentRequired",
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
              target: [PATH_NAMES.PROVE_IDENTITY],
              cond: "isIdentityRequired",
            },
            {
              target: [PATH_NAMES.SHARE_INFO],
              cond: "isConsentRequired",
            },
            { target: [PATH_NAMES.AUTH_CODE] },
          ],
        },
        meta: {
          optionalPaths: [PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS_DISAGREE],
        },
      },
      [PATH_NAMES.SHARE_INFO]: {
        on: {
          [USER_JOURNEY_EVENTS.CONSENT_ACCEPTED]: [PATH_NAMES.AUTH_CODE],
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
          [USER_JOURNEY_EVENTS.RESET_PASSWORD_CODE_VERIFIED]: [
            PATH_NAMES.RESET_PASSWORD,
          ],
        },
        meta: {
          optionalPaths: [PATH_NAMES.RESET_PASSWORD_RESEND_CODE],
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
          [USER_JOURNEY_EVENTS.PASSWORD_CREATED]: [
            {
              target: [PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER],
              cond: "isPhoneNumberVerified",
            },
            { target: [PATH_NAMES.ENTER_MFA], cond: "requiresTwoFactorAuth" },
            {
              target: [PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS],
              cond: "isLatestTermsAndConditionsAccepted",
            },
            {
              target: [PATH_NAMES.SHARE_INFO],
              cond: "isConsentRequired",
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
            PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL,
            PATH_NAMES.ACCOUNT_LOCKED,
            PATH_NAMES.SIGN_IN_OR_CREATE,
          ],
        },
      },
      [PATH_NAMES.PROVE_IDENTITY]: {
        on: {
          [USER_JOURNEY_EVENTS.PROVE_IDENTITY_INIT]: [
            PATH_NAMES.PROVE_IDENTITY_CALLBACK,
          ],
        },
      },
      [PATH_NAMES.PROVE_IDENTITY_CALLBACK]: {
        on: {
          [USER_JOURNEY_EVENTS.PROVE_IDENTITY_CALLBACK]: [PATH_NAMES.AUTH_CODE],
        },
        meta: {
          optionalPaths: [PATH_NAMES.PROVE_IDENTITY],
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
        type: "final",
      },
    },
  },
  {
    guards: {
      isConsentRequired: (context) => context.isConsentRequired === true,
      isLatestTermsAndConditionsAccepted: (context) =>
        context.isLatestTermsAndConditionsAccepted === false,
      requiresUplift: (context) =>
        context.requiresUplift === true && context.isAuthenticated === true,
      requiresTwoFactorAuth: (context) =>
        context.requiresTwoFactorAuth === true,
      isPhoneNumberVerified: (context) =>
        context.isPhoneNumberVerified === false,
      isIdentityRequired: (context) => context.isIdentityRequired === true,
      isAuthenticated: (context) => context.isAuthenticated === true,
      requiresLogin: (context) =>
        context.isAuthenticated === true &&
        context.prompt === OIDC_PROMPT.LOGIN,
      skipAuthentication: (context) =>
        context.skipAuthentication === true &&
        context.isAuthenticated === false,
      supportMFAOptions: (context) => context.supportMFAOptions === true,
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

export { getNextState, USER_JOURNEY_EVENTS };
