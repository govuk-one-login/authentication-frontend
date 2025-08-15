import { PATH_NAMES } from "../../app.constants.js";

interface Page {
  template: string;
  options?: Record<string, unknown>;
}

interface PageVariant extends Page {
  name: string;
}

// Links to https://account.gov.uk
const EXAMPLE_QR_CODE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAN6SURBVO3BQa5bRwADweZA979yx4ssuBrgQdK3nbAq/sLMvw4z5TBTDjPlMFMOM+UwUw4z5TBTDjPlMFMOM+UwUw4z5TBTDjPlxZuS8JNU3pGEG5WWhKbyRBJ+kso7DjPlMFMOM+XFh6l8UhJukvCEyk0SnkhCU7lR+aQkfNJhphxmymGmvPiyJDyh8g6VloSWhKbSVFoSvikJT6h802GmHGbKYaa8+I9TeSIJTeX/5DBTDjPlMFNe/OVUWhJuVG5UWhKayn/ZYaYcZsphprz4MpWfpNKS8EQSnlB5h8qf5DBTDjPlMFNefFgSflISmsoTSWgqLQk3SWgqN0n4kx1mymGmHGbKizep/E2S0FRuVFoSnlD5mxxmymGmHGbKizcloal8UhKayhMqLQktCTcqTeUmCTcqN0l4QuWTDjPlMFMOM+XFD0vCjUpTeUcSmkpLwk0SnlC5ScKf7DBTDjPlMFPiL3xREm5UbpLQVG6S0FRaEj5J5SYJNyotCU2lJeFG5R2HmXKYKYeZ8uLLVG6S0FSayk0SmkpLwhMqTyThRuWTVFoSPukwUw4z5TBTXrwpCTcqLQlPJKGpNJUblU9KQlO5ScKNSlP5nQ4z5TBTDjPlxQ9TuUlCU3lHEppKS0JTaUm4SUJTaSotCe9IQlP5pMNMOcyUw0x58WEqn5SEJ1SeUHmHyk0SbpJwo3KThKbyjsNMOcyUw0x58WVJuFFpKk8koSXhiSQ0labSknCThKbSktBUWhJaEppKS8InHWbKYaYcZsqLL1NpSbhJwhMqn5SEG5WWhJsk3CShqbQk3Kh80mGmHGbKYabEX/iLJeEJlZskNJWbJDSVJ5LQVH6nw0w5zJTDTHnxpiT8JJWm8o4kNJWWhKbyRBKayicloam84zBTDjPlMFNefJjKJyXhiSQ8ofJEEp5Q+SaVTzrMlMNMOcyUF1+WhCdUPkmlJeEJlZaEmyR8UhKeUHnHYaYcZsphprz4j0tCU2lJ+EkqT6i0JHzTYaYcZsphprz4n1NpSbhR+aYk3Ki0JHzSYaYcZsphprz4MpXfSeUmCTcqLQlPqLQk3Kj8ToeZcpgph5ny4sOS8JOS8EQS3qHSktBUblRuktBUftJhphxmymGmxF+Y+ddhphxmymGmHGbKYaYcZsphphxmymGmHGbKYaYcZsphphxmymGm/ANs8XkgbQ6z9gAAAABJRU5ErkJggg=="

// TOOD: AUT-4440 Complete this list
// TODO: AUT-4440 Some kind of UT to detect missing cases - e.g. filter PATH_NAMES by known 'non UI' paths
// TODO: AUT-4439 Screenshot test across each of these pages
// TODO: AUT-4441 Parameter validation for each template
export const pages: Record<string, Page | PageVariant[]> = {
  // Journey start
  [PATH_NAMES.SIGN_IN_OR_CREATE]: { template: "sign-in-or-create/index.njk" },

  // Sign in
  [PATH_NAMES.ENTER_EMAIL_SIGN_IN]: { template: "enter-email/index-existing-account.njk" },
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

  // Sign up
  [PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT]: { template: "enter-email/index-create-account.njk" },
  [PATH_NAMES.ACCOUNT_NOT_FOUND]: [{
    name: "mandatory",
    template: "account-not-found/index-mandatory.njk",
    options: { email: "example@account.gov.uk" },
   }, {
    name: "optional",
    template: "account-not-found/index-optional.njk",
    options: { email: "example@account.gov.uk" },
  }, {
    name: "one login",
    template: "account-not-found/index-one-login.njk",
    options: { email: "example@account.gov.uk" },
  }, {
    name: "mobile",
    template: "account-not-found/index-mobile.njk",
    options: { email: "example@account.gov.uk" },
   }],
  [PATH_NAMES.CHECK_YOUR_EMAIL]: {
    template: "check-your-email/index.njk",
    options: {
      email: "example@account.gov.uk",
    },
  },
  [PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD]: { template: "create-password/index.njk" },
  [PATH_NAMES.GET_SECURITY_CODES]: { template: "select-mfa-options/index.njk" },
  [PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER]: { template: "enter-phone-number/index.njk" },
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
  [PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL]: { template: "account-created/index.njk" },
};
