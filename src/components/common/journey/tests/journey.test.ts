import { expect } from "chai";
import { describe } from "mocha";
import { JOURNEY_TYPE, PATH_NAMES } from "../../../../app.constants";
import {
  getJourneyTypeFromUserSession,
  GetJourneyTypeFromUserSessionOptions,
} from "../journey";
import { UserSession } from "../../../../types";
import { getPermittedJourneyForPath } from "../../../../utils/session";

describe("journey", () => {
  describe("getJourneyTypeFromUserSession", () => {
    it("should return undefined by default", () => {
      const journeyType = getJourneyTypeFromUserSession({
        journey: getPermittedJourneyForPath(PATH_NAMES.CHECK_YOUR_EMAIL),
      });
      expect(journeyType).to.equal(undefined);
    });

    it("should return a specified fallback journeyType", () => {
      const journeyType = getJourneyTypeFromUserSession(
        {
          journey: getPermittedJourneyForPath(PATH_NAMES.CHECK_YOUR_EMAIL),
        },
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
    ];

    callVariants.forEach(({ options, userSession, expectedJourneyType }) => {
      it(`should return ${expectedJourneyType} when user session includes ${JSON.stringify(
        userSession
      )} and options is ${options}`, () => {
        const journeyType = getJourneyTypeFromUserSession(
          {
            journey: getPermittedJourneyForPath(PATH_NAMES.ROOT),
            ...userSession,
          },
          options
        );
        expect(journeyType).to.equal(expectedJourneyType);
      });
    });
  });
});
