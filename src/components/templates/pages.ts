import { MfaMethodPriority } from "../../types.js";
import { MFA_METHOD_TYPE, PATH_NAMES } from "../../app.constants.js";

interface Page {
  template: string;
  options?: Record<string, unknown>;
}

interface PageVariant extends Page {
  name: string;
}

// Links to https://account.gov.uk
const EXAMPLE_QR_CODE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAN6SURBVO3BQa5bRwADweZA979yx4ssuBrgQdK3nbAq/sLMvw4z5TBTDjPlMFMOM+UwUw4z5TBTDjPlMFMOM+UwUw4z5TBTDjPlxZuS8JNU3pGEG5WWhKbyRBJ+kso7DjPlMFMOM+XFh6l8UhJukvCEyk0SnkhCU7lR+aQkfNJhphxmymGmvPiyJDyh8g6VloSWhKbSVFoSvikJT6h802GmHGbKYaa8+I9TeSIJTeX/5DBTDjPlMFNe/OVUWhJuVG5UWhKayn/ZYaYcZsphprz4MpWfpNKS8EQSnlB5h8qf5DBTDjPlMFNefFgSflISmsoTSWgqLQk3SWgqN0n4kx1mymGmHGbKizep/E2S0FRuVFoSnlD5mxxmymGmHGbKizcloal8UhKayhMqLQktCTcqTeUmCTcqN0l4QuWTDjPlMFMOM+XFD0vCjUpTeUcSmkpLwk0SnlC5ScKf7DBTDjPlMFPiL3xREm5UbpLQVG6S0FRaEj5J5SYJNyotCU2lJeFG5R2HmXKYKYeZ8uLLVG6S0FSayk0SmkpLwhMqTyThRuWTVFoSPukwUw4z5TBTXrwpCTcqLQlPJKGpNJUblU9KQlO5ScKNSlP5nQ4z5TBTDjPlxQ9TuUlCU3lHEppKS0JTaUm4SUJTaSotCe9IQlP5pMNMOcyUw0x58WEqn5SEJ1SeUHmHyk0SbpJwo3KThKbyjsNMOcyUw0x58WVJuFFpKk8koSXhiSQ0labSknCThKbSktBUWhJaEppKS8InHWbKYaYcZsqLL1NpSbhJwhMqn5SEG5WWhJsk3CShqbQk3Kh80mGmHGbKYabEX/iLJeEJlZskNJWbJDSVJ5LQVH6nw0w5zJTDTHnxpiT8JJWm8o4kNJWWhKbyRBKayicloam84zBTDjPlMFNefJjKJyXhiSQ8ofJEEp5Q+SaVTzrMlMNMOcyUF1+WhCdUPkmlJeEJlZaEmyR8UhKeUHnHYaYcZsphprz4j0tCU2lJ+EkqT6i0JHzTYaYcZsphprz4n1NpSbhR+aYk3Ki0JHzSYaYcZsphprz4MpXfSeUmCTcqLQlPqLQk3Kj8ToeZcpgph5ny4sOS8JOS8EQS3qHSktBUblRuktBUftJhphxmymGmxF+Y+ddhphxmymGmHGbKYaYcZsphphxmymGmHGbKYaYcZsphphxmymGm/ANs8XkgbQ6z9gAAAABJRU5ErkJggg==";

// TODO: AUT-4441 Parameter validation for each template
export const pages: Record<string, Page | PageVariant[]> = {
  // Sign in
  [PATH_NAMES.SIGN_IN_OR_CREATE]: [
    {
      name: "default with international sms supported",
      template: "sign-in-or-create/index.njk",
      options: {
        isInternationalSmsEnabled: true,
      },
    },
    {
      name: "default with uk sms only",
      template: "sign-in-or-create/index.njk",
      options: {
        isInternationalSmsEnabled: false,
      },
    },
    {
      name: "generic app",
      template: "sign-in-or-create/index-generic-app.njk",
    },
    {
      name: "strategic app",
      template: "sign-in-or-create/index-strategic-app.njk",
    },
  ],
  [PATH_NAMES.ENTER_EMAIL_SIGN_IN]: [
    {
      name: "default",
      template: "enter-email/index-existing-account.njk",
    },
    {
      name: "reauth",
      template: "enter-email/index-re-enter-email-account.njk",
    },
    {
      name: "lockout",
      template: "enter-email/index-sign-in-details-entered-too-many-times.njk",
    },
  ],
  [PATH_NAMES.ENTER_PASSWORD]: { template: "enter-password/index.njk" },
  [PATH_NAMES.ENTER_PASSWORD_ACCOUNT_EXISTS]: {
    template: "enter-password/index-account-exists.njk",
    options: { email: "example@account.gov.uk" },
  },
  [PATH_NAMES.ENTER_MFA]: [
    {
      name: "sms only",
      template: "enter-mfa/index.njk",
      options: {
        phoneNumber: "123",
        isAccountRecoveryPermitted: true,
        hasMultipleMfaMethods: false,
        mfaIssuePath: "#",
      },
    },
    {
      name: "multiple methods",
      template: "enter-mfa/index.njk",
      options: {
        phoneNumber: "123",
        isAccountRecoveryPermitted: true,
        hasMultipleMfaMethods: true,
        mfaIssuePath: "#",
      },
    },
    {
      name: "uplift",
      template: "enter-mfa/index-2fa-service-uplift-mobile-phone.njk",
      options: {
        phoneNumber: "123",
        isAccountRecoveryPermitted: true,
        hasMultipleMfaMethods: false,
        mfaIssuePath: "#",
      },
    },
  ],
  [PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE]: [
    {
      name: "auth app only",
      template: "enter-authenticator-app-code/index.njk",
      options: {
        isAccountRecoveryPermitted: true,
        hasMultipleMfaMethods: false,
        mfaIssuePath: "#",
      },
    },
    {
      name: "multiple methods",
      template: "enter-authenticator-app-code/index.njk",
      options: {
        isAccountRecoveryPermitted: true,
        hasMultipleMfaMethods: true,
        mfaIssuePath: "#",
      },
    },
    {
      name: "uplift",
      template:
        "enter-authenticator-app-code/index-2fa-service-uplift-auth-app.njk",
      options: {
        isAccountRecoveryPermitted: true,
        hasMultipleMfaMethods: false,
        mfaIssuePath: "#",
      },
    },
  ],
  [PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES]: {
    template: "how-do-you-want-security-codes/index.njk",
    options: {
      mfaResetLink: "#",
      mfaMethods: [
        {
          type: MFA_METHOD_TYPE.SMS,
          priority: MfaMethodPriority.BACKUP,
          redactedPhoneNumber: "123",
        },
        {
          type: MFA_METHOD_TYPE.AUTH_APP,
          priority: MfaMethodPriority.DEFAULT,
        },
      ],
      supportMfaReset: true,
    },
  },
  [PATH_NAMES.RESEND_MFA_CODE]: [
    {
      name: "default",
      template: "resend-mfa-code/index.njk",
      options: {
        redactedPhoneNumber: "123",
        isResendCodeRequest: false,
        supportReauthentication: true,
        isReauthJourney: false,
      },
    },
    {
      name: "reauth",
      template: "resend-mfa-code/index.njk",
      options: {
        redactedPhoneNumber: "123",
        isResendCodeRequest: false,
        supportReauthentication: true,
        isReauthJourney: true,
      },
    },
  ],
  [PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS]: {
    template: "updated-terms-conditions/index.njk",
  },

  // Sign up
  [PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT]: {
    template: "enter-email/index-create-account.njk",
  },
  [PATH_NAMES.ACCOUNT_NOT_FOUND]: [
    {
      name: "mandatory",
      template: "account-not-found/index-mandatory.njk",
      options: { email: "example@account.gov.uk" },
    },
    {
      name: "optional",
      template: "account-not-found/index-optional.njk",
      options: { email: "example@account.gov.uk" },
    },
    {
      name: "one login",
      template: "account-not-found/index-one-login.njk",
      options: { email: "example@account.gov.uk" },
    },
    {
      name: "mobile",
      template: "account-not-found/index-mobile.njk",
      options: { email: "example@account.gov.uk" },
    },
  ],
  [PATH_NAMES.CHECK_YOUR_EMAIL]: {
    template: "check-your-email/index.njk",
    options: {
      email: "example@account.gov.uk",
    },
  },
  [PATH_NAMES.RESEND_EMAIL_CODE]: {
    template: "resend-email-code/index.njk",
    options: {
      emailAddress: "example@account.gov.uk",
      requestNewCode: false,
    },
  },
  [PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD]: {
    template: "create-password/index.njk",
  },
  [PATH_NAMES.GET_SECURITY_CODES]: [
    {
      name: "default with international sms supported",
      template: "select-mfa-options/index.njk",
      options: { supportNewInternationalSms: true },
    },
    {
      name: "default with uk sms only",
      template: "select-mfa-options/index.njk",
      options: { supportNewInternationalSms: false },
    },
    {
      name: "account part created with international sms supported",
      template: "select-mfa-options/index.njk",
      options: {
        isAccountPartCreated: true,
        supportNewInternationalSms: true,
      },
    },
    {
      name: "account part created with uk sms only",
      template: "select-mfa-options/index.njk",
      options: {
        isAccountPartCreated: true,
        supportNewInternationalSms: false,
      },
    },
    {
      name: "account recovery with international sms supported",
      template: "select-mfa-options/index.njk",
      options: {
        isAccountRecoveryJourney: true,
        supportNewInternationalSms: true,
      },
    },
    {
      name: "account recovery with uk sms only",
      template: "select-mfa-options/index.njk",
      options: {
        isAccountRecoveryJourney: true,
        supportNewInternationalSms: false,
      },
    },
  ],
  [PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER]: {
    template: "enter-phone-number/index.njk",
  },
  [PATH_NAMES.CHECK_YOUR_PHONE]: {
    template: "check-your-phone/index.njk",
    options: {
      phoneNumber: "123",
      resendCodeLink: "#",
    },
  },
  [PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP]: {
    template: "setup-authenticator-app/index.njk",
    options: {
      qrCode: EXAMPLE_QR_CODE,
      secretKeyFragmentArray: ["example-secret"],
    },
  },
  [PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION]: [
    {
      name: "default",
      template: "account-creation/resend-mfa-code/index.njk",
      options: {
        phoneNumber: "123",
        isResendCodeRequest: false,
      },
    },
    {
      name: "resend",
      template: "account-creation/resend-mfa-code/index.njk",
      options: {
        phoneNumber: "123",
        isResendCodeRequest: true,
      },
    },
  ],
  [PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL]: {
    template: "account-created/index.njk",
  },

  // PYI callback
  [PATH_NAMES.PROVE_IDENTITY_CALLBACK]: [
    {
      name: "default",
      template: "prove-identity-callback/index.njk",
      options: { serviceName: "Example" },
    },
    {
      name: "new",
      template: "prove-identity-callback/index-new-spinner.njk",
      options: {
        serviceName: "Example",
        spinnerApiUrl: "/templates/prove-identity-status",
      },
    },
  ],

  // Reset password
  [PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL]: [
    {
      name: "unforced",
      template: "reset-password-check-email/index.njk",
      options: {
        email: "example@account.gov.uk",
        isForcedPasswordResetJourney: false,
      },
    },
    {
      name: "forced",
      template: "reset-password-check-email/index.njk",
      options: {
        email: "example@account.gov.uk",
        isForcedPasswordResetJourney: true,
      },
    },
  ],
  [PATH_NAMES.RESET_PASSWORD_RESEND_CODE]: {
    template: "reset-password-check-email/index-reset-password-resend-code.njk",
    options: { email: "example@account.gov.uk" },
  },
  [PATH_NAMES.RESET_PASSWORD]: [
    {
      name: "default",
      template: "reset-password/index.njk",
      options: { isPasswordChangeRequired: false },
    },
    {
      name: "required",
      template: "reset-password/index.njk",
      options: { isPasswordChangeRequired: true },
    },
  ],
  [PATH_NAMES.RESET_PASSWORD_2FA_SMS]: {
    template: "reset-password-2fa-sms/index.njk",
    options: {
      phoneNumber: "123",
      resendCodeLink: "",
      hasMultipleMfaMethods: false,
      chooseMfaMethodHref: "#",
    },
  },
  [PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP]: {
    template: "reset-password-2fa-auth-app/index.njk",
    options: {
      hasMultipleMfaMethods: false,
      chooseMfaMethodHref: "#",
    },
  },

  // MFA Reset
  [PATH_NAMES.OPEN_IN_WEB_BROWSER]: {
    template: "mfa-reset-with-ipv/index-open-in-browser-mfa-reset.njk",
    options: {
      backLink: "#",
    },
  },
  [PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES]: {
    template: "ipv-callback/index-cannot-change-how-get-security-codes.njk",
    options: {
      variant: "incomplete",
      formPostPath: "#",
    },
  },
  [PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL]: {
    template: "ipv-callback/index-cannot-change-how-get-security-codes.njk",
    options: {
      variant: "identityFailed",
      formPostPath: "#",
    },
  },
  [PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION]: [
    {
      name: "sms",
      template: "account-recovery/change-security-codes-confirmation/index.njk",
      options: {
        mfaMethodType: MFA_METHOD_TYPE.SMS,
        phoneNumber: "123",
      },
    },
    {
      name: "auth app",
      template: "account-recovery/change-security-codes-confirmation/index.njk",
      options: {
        mfaMethodType: MFA_METHOD_TYPE.AUTH_APP,
      },
    },
  ],

  // Lockouts
  [PATH_NAMES.ACCOUNT_LOCKED]: {
    template: "enter-password/index-account-locked.njk",
  },
  [PATH_NAMES.SIGN_IN_RETRY_BLOCKED]: {
    template: "enter-password/index-sign-in-retry-blocked.njk",
  },
  [PATH_NAMES.SECURITY_CODE_INVALID]: [
    {
      name: "sms/email",
      template: "security-code-error/index.njk",
      options: {
        newCodeLink: "#",
        isAuthApp: false,
        isBlocked: false,
        show2HrScreen: false,
      },
    },
    {
      name: "sms/email blocked",
      template: "security-code-error/index.njk",
      options: {
        newCodeLink: "#",
        isAuthApp: false,
        isBlocked: true,
        show2HrScreen: false,
      },
    },
    {
      name: "auth app",
      template: "security-code-error/index.njk",
      options: {
        newCodeLink: "#",
        isAuthApp: true,
        isBlocked: false,
        show2HrScreen: false,
      },
    },
    {
      name: "auth app blocked",
      template: "security-code-error/index.njk",
      options: {
        newCodeLink: "#",
        isAuthApp: true,
        isBlocked: true,
        show2HrScreen: false,
      },
    },
    {
      name: "2hr lockout",
      template: "security-code-error/index.njk",
      options: {
        newCodeLink: "#",
        isAuthApp: true,
        isBlocked: false,
        show2HrScreen: true,
      },
    },
  ],
  [PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT]: {
    template: "security-code-error/index-wait.njk",
    options: { newCodeLink: "#" },
  },
  [PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED]: [
    {
      name: "sms/email",
      template: "security-code-error/index-security-code-entered-exceeded.njk",
      options: {
        newCodeLink: "#",
        isAuthApp: false,
      },
    },
    {
      name: "auth app",
      template: "security-code-error/index-security-code-entered-exceeded.njk",
      options: {
        newCodeLink: "#",
        isAuthApp: false,
      },
    },
  ],
  [PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED]: {
    template: "security-code-error/index-too-many-requests.njk",
    options: {
      newCodeLink: "#",
      isResendCodeRequest: false,
      isAccountCreationJourney: false,
    },
  },
  [PATH_NAMES.SECURITY_CODE_WAIT]: {
    template: "security-code-error/index-too-many-requests.njk",
    options: { newCodeLink: "#" },
  },

  // Account interventions
  [PATH_NAMES.PASSWORD_RESET_REQUIRED]: {
    template: "account-intervention/password-reset-required/index.njk",
  },
  [PATH_NAMES.UNAVAILABLE_PERMANENT]: {
    template: "account-intervention/permanently-blocked/index.njk",
  },
  [PATH_NAMES.UNAVAILABLE_TEMPORARY]: {
    template: "account-intervention/temporarily-blocked/index.njk",
  },

  // Errors
  [PATH_NAMES.ERROR_PAGE]: [
    {
      name: "500",
      template: "common/errors/500.njk",
    },
    {
      name: "404",
      template: "common/errors/404.njk",
    },
    {
      name: "mid-journey navigation",
      template: "common/errors/mid-journey-direct-navigation.njk",
    },
    {
      name: "session expired",
      template: "common/errors/session-expired.njk",
    },
  ],
  [PATH_NAMES.PROVE_IDENTITY_CALLBACK_SESSION_EXPIRY_ERROR]: {
    template: "prove-identity-callback/session-expiry-error.njk",
  },
  [PATH_NAMES.SIGNED_OUT]: {
    template: "signed-out/index.njk",
    options: { signinLink: "#" },
  },

  // Footer pages
  [PATH_NAMES.PRIVACY_POLICY]: {
    template: "common/footer/privacy-statement.njk",
  },
  [PATH_NAMES.PRIVACY_POLICY_NEW]: {
    template: "common/footer/privacy-statement.njk",
  },
  [PATH_NAMES.TERMS_AND_CONDITIONS]: {
    template: "common/footer/terms-conditions.njk",
  },
  [PATH_NAMES.ACCESSIBILITY_STATEMENT]: {
    template: "common/footer/accessibility-statement.njk",
  },
  [PATH_NAMES.SUPPORT]: {
    template: "common/footer/support.njk",
  },
  [PATH_NAMES.COOKIES_POLICY]: {
    template: "common/cookies/index.njk",
    options: {
      originalReferer: "https://account.gov.uk",
      analyticsConsent: true,
      updated: false,
    },
  },

  // Contact form
  [PATH_NAMES.CONTACT_US]: [
    {
      name: "public",
      template: "contact-us/index-public-contact-us.njk",
    },
    {
      name: "government service",
      template: "contact-us/index-gov-service-contact-us.njk",
    },
  ],
  [PATH_NAMES.CANNOT_USE_EMAIL_ADDRESS]: {
    template: "cannot-use-email-address/index.njk",
  },
};
