import { expect } from "chai";
import { describe } from "mocha";
import { JOURNEY_TYPE } from "../../../../app.constants.js";
import type { GetJourneyTypeFromUserSessionOptions } from "../journey.js";
import { getJourneyTypeFromUserSession } from "../journey.js";
import type { UserSession } from "../../../../types.js";
describe("journey", () => {
  describe("getJourneyTypeFromUserSession", () => {
    it("should return undefined by default", () => {
      const journeyType = getJourneyTypeFromUserSession({});
      expect(journeyType).to.equal(undefined);
    });

    it("should return a specified fallback journeyType", () => {
      const journeyType = getJourneyTypeFromUserSession(
        {},
        { fallbackJourneyType: JOURNEY_TYPE.SIGN_IN }
      );
      expect(journeyType).to.equal(JOURNEY_TYPE.SIGN_IN);
    });

    const callVariants: {
      options: GetJourneyTypeFromUserSessionOptions;
      userSession: Partial<UserSession>;
      expectedJourneyType: JOURNEY_TYPE | undefined;
    }[] = [
      // Return REAUTHENTICATION as expected
      {
        options: {
          includeReauthentication: true,
        },
        userSession: {
          reauthenticate: "test_data",
        },
        expectedJourneyType: JOURNEY_TYPE.REAUTHENTICATION,
      },
      // Return REAUTHENTICATION prevented as not included in options
      {
        options: {},
        userSession: {
          reauthenticate: "test_data",
        },
        expectedJourneyType: undefined,
      },
      // Return ACCOUNT_RECOVERY as expected
      {
        options: {
          includeAccountRecovery: true,
        },
        userSession: {
          isAccountRecoveryPermitted: true,
          isAccountRecoveryJourney: true,
        },
        expectedJourneyType: JOURNEY_TYPE.ACCOUNT_RECOVERY,
      },
      // Return ACCOUNT_RECOVERY prevented as not included in options
      {
        options: {},
        userSession: {
          isAccountRecoveryPermitted: true,
          isAccountRecoveryJourney: true,
        },
        expectedJourneyType: undefined,
      },
      // Return PASSWORD_RESET_MFA as expected
      {
        options: {
          includePasswordResetMfa: true,
        },
        userSession: {
          isPasswordResetJourney: true,
        },
        expectedJourneyType: JOURNEY_TYPE.PASSWORD_RESET_MFA,
      },
      // Return PASSWORD_RESET_MFA prevented as not included in options
      {
        options: {},
        userSession: {
          isPasswordResetJourney: true,
        },
        expectedJourneyType: undefined,
      },
    ];

    callVariants.forEach(({ options, userSession, expectedJourneyType }) => {
      it(`should return ${expectedJourneyType} when user session includes ${JSON.stringify(
        userSession
      )} and options is ${options}`, () => {
        const journeyType = getJourneyTypeFromUserSession(userSession, options);
        expect(journeyType).to.equal(expectedJourneyType);
      });
    });
  });
});
