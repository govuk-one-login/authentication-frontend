import { PATH_NAMES } from "../../src/app.constants.js";
import { StateGroup } from "./index.js";
import { INTERMEDIATE_STATES } from "../../src/components/common/state-machine/state-machine.js";

export const AUTH_STATE_GROUPS: StateGroup[] = [
  // Start
  {
    title: "Start",
    states: [
      PATH_NAMES.AUTHORIZE,
      PATH_NAMES.SIGN_IN_OR_CREATE,
      PATH_NAMES.UPLIFT_JOURNEY,
    ],
  },

  // Create account
  {
    title: "Create account",
    states: [
      PATH_NAMES.ACCOUNT_NOT_FOUND,
      PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT,
      PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT_REQUEST,
      PATH_NAMES.CHECK_YOUR_EMAIL,
      PATH_NAMES.RESEND_EMAIL_CODE,
      PATH_NAMES.CANNOT_USE_EMAIL_ADDRESS,
      PATH_NAMES.CANNOT_USE_EMAIL_ADDRESS_CONTINUE,
      PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL,
    ],
  },
  {
    title: "Create account - Password",
    states: [PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD],
  },
  {
    title: "Set up MFA",
    states: [
      PATH_NAMES.GET_SECURITY_CODES,
      PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
      PATH_NAMES.CHECK_YOUR_PHONE,
      PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION,
      PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP,
      PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION,
    ],
  },

  // Sign in
  {
    title: "Sign in",
    states: [PATH_NAMES.ENTER_EMAIL_SIGN_IN],
  },
  {
    title: "Sign in - Password",
    states: [
      PATH_NAMES.ENTER_PASSWORD,
      PATH_NAMES.ENTER_PASSWORD_ACCOUNT_EXISTS,
      PATH_NAMES.SIGN_IN_RETRY_BLOCKED,
      INTERMEDIATE_STATES.PASSWORD_VERIFIED,
    ],
  },
  {
    title: "Sign in - MFA",
    states: [
      PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
      PATH_NAMES.ENTER_MFA,
      PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES,
      PATH_NAMES.RESEND_MFA_CODE,
    ],
  },
  {
    title: "Sign in - Passkey",
    states: [
      PATH_NAMES.ACCOUNT_EXISTS_WITH_PASSKEY,
      PATH_NAMES.SIGN_IN_WITH_PASSKEY,
      PATH_NAMES.CANNOT_SIGN_IN_PASSKEY,
    ],
  },

  // Resets
  {
    title: "Password reset",
    states: [
      PATH_NAMES.PASSWORD_RESET_REQUIRED,
      PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL,
      PATH_NAMES.RESET_PASSWORD_RESEND_CODE,
      PATH_NAMES.RESET_PASSWORD,
      PATH_NAMES.RESET_PASSWORD_2FA_SMS,
      PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP,
      PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS,
      PATH_NAMES.RESET_PASSWORD_REQUEST,
    ],
  },
  {
    title: "MFA reset",
    states: [
      PATH_NAMES.MFA_RESET_WITH_IPV,
      PATH_NAMES.IPV_CALLBACK,
      PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES,
      PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL,
      PATH_NAMES.OPEN_IN_WEB_BROWSER,
    ],
  },
  {
    title: "SFAD",
    states: [PATH_NAMES.SFAD_AUTHORIZE, PATH_NAMES.SFAD_CALLBACK],
  },

  // Sign-in end
  {
    title: "Create passkey",
    states: [
      PATH_NAMES.CREATE_PASSKEY,
      PATH_NAMES.CREATE_PASSKEY_CALLBACK,
      PATH_NAMES.PASSKEY_CREATED,
    ],
  },
  {
    title: "Updated Ts & Cs",
    states: [PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS],
  },

  // End
  {
    title: "End",
    states: [
      PATH_NAMES.AUTH_CODE,
      PATH_NAMES.UNAVAILABLE_PERMANENT,
      PATH_NAMES.UNAVAILABLE_TEMPORARY,
    ],
  },

  // Other
  {
    title: "IPV spinner page",
    states: [
      PATH_NAMES.PROVE_IDENTITY_CALLBACK,
      PATH_NAMES.PROVE_IDENTITY_CALLBACK_STATUS,
    ],
  },
];
