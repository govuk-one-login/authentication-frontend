import { expect } from "chai";
import { describe } from "mocha";
import { getNextState, USER_JOURNEY_EVENTS } from "../state-machine";
import { PATH_NAMES } from "../../../../app.constants";

describe("state-machine", () => {
  describe("getNextState - login journey (2fa)", () => {
    it("should move from initial state to sign or create when user event is landing", () => {
      const nextState = getNextState(
        PATH_NAMES.START,
        USER_JOURNEY_EVENTS.LANDING
      );
      expect(nextState.value).to.equal(PATH_NAMES.SIGN_IN_OR_CREATE);
    });

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
    it("should move from initial state to sign or create when user event is landing", () => {
      const nextState = getNextState(
        PATH_NAMES.START,
        USER_JOURNEY_EVENTS.LANDING
      );
      expect(nextState.value).to.equal(PATH_NAMES.SIGN_IN_OR_CREATE);
    });

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
    it("should move from initial state to sign or create when user event is landing", () => {
      const nextState = getNextState(
        PATH_NAMES.START,
        USER_JOURNEY_EVENTS.LANDING
      );
      expect(nextState.value).to.equal(PATH_NAMES.SIGN_IN_OR_CREATE);
    });

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
});
