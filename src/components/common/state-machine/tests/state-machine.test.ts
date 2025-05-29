import { expect } from "chai";
import { describe } from "mocha";
import { getNextState, USER_JOURNEY_EVENTS } from "../state-machine.js";
import { MFA_METHOD_TYPE, PATH_NAMES } from "../../../../app.constants.js";
describe("state-machine", () => {
  describe(`getNextState - ${PATH_NAMES.AUTHORIZE} on ${USER_JOURNEY_EVENTS.EXISTING_SESSION}`, () => {
    describe("where isIdentityRequired", () => {
      it(`should move from ${PATH_NAMES.AUTHORIZE} to ${PATH_NAMES.AUTH_CODE}`, () => {
        const nextState = getNextState(
          PATH_NAMES.AUTHORIZE,
          USER_JOURNEY_EVENTS.EXISTING_SESSION,
          { isIdentityRequired: true }
        );

        expect(nextState.value).to.equal(PATH_NAMES.AUTH_CODE);
      });
      it(`should stay on ${PATH_NAMES.AUTHORIZE}`, () => {
        const nextState = getNextState(
          PATH_NAMES.AUTHORIZE,
          USER_JOURNEY_EVENTS.EXISTING_SESSION,
          { isIdentityRequired: false }
        );
        expect(nextState.value).to.equal(PATH_NAMES.AUTHORIZE);
      });
      it(`should move from ${PATH_NAMES.AUTHORIZE} to ${PATH_NAMES.ENTER_EMAIL_SIGN_IN}`, () => {
        const nextState = getNextState(
          PATH_NAMES.AUTHORIZE,
          USER_JOURNEY_EVENTS.EXISTING_SESSION,
          {
            isIdentityRequired: true,
            isAuthenticated: true,
            isReauthenticationRequired: true,
          }
        );
        expect(nextState.value).to.equal(PATH_NAMES.ENTER_EMAIL_SIGN_IN);
      });
      it(`should move from ${PATH_NAMES.AUTHORIZE} to ${PATH_NAMES.AUTH_CODE}`, () => {
        const nextState = getNextState(
          PATH_NAMES.AUTHORIZE,
          USER_JOURNEY_EVENTS.EXISTING_SESSION,
          {
            isIdentityRequired: true,
            isAuthenticated: true,
            isReauthenticationRequired: false,
          }
        );
        expect(nextState.value).to.equal(PATH_NAMES.AUTH_CODE);
      });
    });
  });

  describe(`getNextState - ${PATH_NAMES.AUTHORIZE} on ${USER_JOURNEY_EVENTS.NO_EXISTING_SESSION}`, () => {
    describe("where isIdentityRequired", () => {
      it(`should move from ${PATH_NAMES.AUTHORIZE} to ${PATH_NAMES.SIGN_IN_OR_CREATE}`, () => {
        const nextState = getNextState(
          PATH_NAMES.AUTHORIZE,
          USER_JOURNEY_EVENTS.NO_EXISTING_SESSION,
          { isIdentityRequired: true }
        );

        expect(nextState.value).to.equal(PATH_NAMES.SIGN_IN_OR_CREATE);
      });
    });
  });
  describe("getNextState - login journey (2fa)", () => {
    it("should move from sign or create to enter email when user event is sign in", () => {
      const nextState = getNextState(
        PATH_NAMES.SIGN_IN_OR_CREATE,
        USER_JOURNEY_EVENTS.SIGN_IN
      );
      expect(nextState.value).to.equal(PATH_NAMES.ENTER_EMAIL_SIGN_IN);
    });

    it("should move from enter email to enter password when user event is validate credentials", () => {
      const nextState = getNextState(
        PATH_NAMES.ENTER_EMAIL_SIGN_IN,
        USER_JOURNEY_EVENTS.VALIDATE_CREDENTIALS
      );
      expect(nextState.value).to.equal(PATH_NAMES.ENTER_PASSWORD);
    });

    it("should move from enter password to enter mfa code when user event is credentials validated", () => {
      const nextState = getNextState(
        PATH_NAMES.ENTER_PASSWORD,
        USER_JOURNEY_EVENTS.CREDENTIALS_VALIDATED,
        { requiresTwoFactorAuth: true }
      );
      expect(nextState.value).to.equal(PATH_NAMES.ENTER_MFA);
    });

    it("should move from mfa code verified state to auth code when user event is mfa code verified", () => {
      const nextState = getNextState(
        PATH_NAMES.ENTER_MFA,
        USER_JOURNEY_EVENTS.MFA_CODE_VERIFIED
      );
      expect(nextState.value).to.equal(PATH_NAMES.AUTH_CODE);
    });
  });

  describe("getNextState - login journey (non 2fa)", () => {
    it("should move from sign or create to enter email when user event is sign in", () => {
      const nextState = getNextState(
        PATH_NAMES.SIGN_IN_OR_CREATE,
        USER_JOURNEY_EVENTS.SIGN_IN
      );
      expect(nextState.value).to.equal(PATH_NAMES.ENTER_EMAIL_SIGN_IN);
    });

    it("should move from enter email to enter password when user event is validate credentials", () => {
      const nextState = getNextState(
        PATH_NAMES.ENTER_EMAIL_SIGN_IN,
        USER_JOURNEY_EVENTS.VALIDATE_CREDENTIALS
      );
      expect(nextState.value).to.equal(PATH_NAMES.ENTER_PASSWORD);
    });

    it("should move from enter password to auth code when user doesn't require 2fa", () => {
      const nextState = getNextState(
        PATH_NAMES.ENTER_PASSWORD,
        USER_JOURNEY_EVENTS.CREDENTIALS_VALIDATED,
        { requiresTwoFactorAuth: false }
      );
      expect(nextState.value).to.equal(PATH_NAMES.AUTH_CODE);
    });
  });
  describe("getNextState - register", () => {
    it("should move from sign or create to enter email when user event is create account", () => {
      const nextState = getNextState(
        PATH_NAMES.SIGN_IN_OR_CREATE,
        USER_JOURNEY_EVENTS.CREATE_NEW_ACCOUNT
      );
      expect(nextState.value).to.equal(PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT);
    });

    it("should move from enter email to check your email when email verification code sent event", () => {
      const nextState = getNextState(
        PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT,
        USER_JOURNEY_EVENTS.SEND_EMAIL_CODE
      );
      expect(nextState.value).to.equal(PATH_NAMES.CHECK_YOUR_EMAIL);
    });

    it("should move from check your email to create password when email verified code event", () => {
      const nextState = getNextState(
        PATH_NAMES.CHECK_YOUR_EMAIL,
        USER_JOURNEY_EVENTS.EMAIL_CODE_VERIFIED
      );
      expect(nextState.value).to.equal(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD);
    });

    it("should move from create password to get security codes when password created event", () => {
      const nextState = getNextState(
        PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD,
        USER_JOURNEY_EVENTS.PASSWORD_CREATED
      );
      expect(nextState.value).to.equal(PATH_NAMES.GET_SECURITY_CODES);
    });

    it("should move from check your phone to account confirmation when phone number verified event", () => {
      const nextState = getNextState(
        PATH_NAMES.CHECK_YOUR_PHONE,
        USER_JOURNEY_EVENTS.PHONE_NUMBER_VERIFIED
      );
      expect(nextState.value).to.equal(PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL);
    });

    it("should move from account created to auth code when user successfully has created an account", () => {
      const nextState = getNextState(
        PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL,
        USER_JOURNEY_EVENTS.ACCOUNT_CREATED
      );
      expect(nextState.value).to.equal(PATH_NAMES.AUTH_CODE);
    });

    it("should move from authorize to sign or create when reauthentication is requested and the user is already logged in", () => {
      const nextState = getNextState(
        PATH_NAMES.AUTHORIZE,
        USER_JOURNEY_EVENTS.EXISTING_SESSION,
        { isAuthenticated: true, isReauthenticationRequired: true }
      );
      expect(nextState.value).to.equal(PATH_NAMES.ENTER_EMAIL_SIGN_IN);
    });

    it("should move from authorize to sign or create when reauthentication is requested and the user is not logged in", () => {
      const nextState = getNextState(
        PATH_NAMES.AUTHORIZE,
        USER_JOURNEY_EVENTS.NO_EXISTING_SESSION,
        { isReauthenticationRequired: true }
      );
      expect(nextState.value).to.equal(PATH_NAMES.ENTER_EMAIL_SIGN_IN);
    });

    it("should move from authorize to auth code create when the user is already logged in", () => {
      const nextState = getNextState(
        PATH_NAMES.AUTHORIZE,
        USER_JOURNEY_EVENTS.EXISTING_SESSION,
        { isAuthenticated: true }
      );
      expect(nextState.value).to.equal(PATH_NAMES.AUTH_CODE);
    });
  });

  describe("getNextState - password reset", () => {
    [
      {
        context: {
          requiresTwoFactorAuth: true,
          isMfaMethodVerified: false,
          mfaMethodType: MFA_METHOD_TYPE.SMS,
        },
        destination: PATH_NAMES.GET_SECURITY_CODES,
      },
      {
        context: {
          requiresTwoFactorAuth: true,
          mfaMethodType: MFA_METHOD_TYPE.SMS,
          isLatestTermsAndConditionsAccepted: false,
        },
        destination: PATH_NAMES.ENTER_MFA,
      },
      {
        context: {
          requiresTwoFactorAuth: true,
          mfaMethodType: MFA_METHOD_TYPE.AUTH_APP,
          isLatestTermsAndConditionsAccepted: false,
        },
        destination: PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
      },
      {
        context: {
          requiresTwoFactorAuth: false,
          isLatestTermsAndConditionsAccepted: false,
        },
        destination: PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS,
      },
      {
        context: { requiresTwoFactorAuth: false, isMfaMethodVerified: false },
        destination: PATH_NAMES.GET_SECURITY_CODES,
      },
      {
        context: { requiresTwoFactorAuth: false, mfaMethodType: MFA_METHOD_TYPE.SMS },
        destination: PATH_NAMES.AUTH_CODE,
      },
      {
        context: {
          requiresTwoFactorAuth: false,
          mfaMethodType: MFA_METHOD_TYPE.AUTH_APP,
        },
        destination: PATH_NAMES.AUTH_CODE,
      },
    ].forEach((test) => {
      it(`should move from ${PATH_NAMES.RESET_PASSWORD} to ${test.destination}`, () => {
        const nextState = getNextState(
          PATH_NAMES.RESET_PASSWORD,
          USER_JOURNEY_EVENTS.PASSWORD_CREATED,
          test.context
        );
        expect(nextState.value).to.equal(test.destination);
      });
    });
  });
});
