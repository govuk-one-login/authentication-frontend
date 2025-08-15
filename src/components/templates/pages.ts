import { PATH_NAMES } from "../../app.constants.js";

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

// TOOD: AUT-4440 Complete this list with all other pages, perhaps with a test to detect missing cases
// TODO: AUT-4439 Screenshot test across each of these pages
// TODO: AUT-4441 Parameter validation for each template
export const pages: Record<string, Page | PageVariant[]> = {
  // Sign in
  [PATH_NAMES.SIGN_IN_OR_CREATE]: { template: "sign-in-or-create/index.njk" },
  [PATH_NAMES.ENTER_EMAIL_SIGN_IN]: {
    template: "enter-email/index-existing-account.njk",
  },
  [PATH_NAMES.ENTER_PASSWORD]: { template: "enter-password/index.njk" },
  [PATH_NAMES.ENTER_PASSWORD_ACCOUNT_EXISTS]: {
    template: "enter-password/index-account-exists.njk",
    options: { email: "example@account.gov.uk" },
  },
  [PATH_NAMES.ENTER_MFA]: {
    template: "enter-mfa/index.njk",
    options: {
      phoneNumber: "123",
      isAccountRecoveryPermitted: true,
      hasMultipleMfaMethods: false,
      mfaIssuePath: "#",
    },
  },
  [PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE]: [
    {
      name: "default",
      template: "enter-authenticator-app-code/index.njk",
      options: {
        isAccountRecoveryPermitted: true,
        hasMultipleMfaMethods: false,
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
  [PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD]: {
    template: "create-password/index.njk",
  },
  [PATH_NAMES.GET_SECURITY_CODES]: { template: "select-mfa-options/index.njk" },
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
  [PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL]: {
    template: "account-created/index.njk",
  },

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
  [PATH_NAMES.RESET_PASSWORD]: {
    template: "reset-password/index.njk",
    options: { isPasswordChangeRequired: false },
  },
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
  [PATH_NAMES.RESET_PASSWORD_REQUIRED]: {
    template: "reset-password/index.njk",
    options: { isPasswordChangeRequired: true },
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
};
