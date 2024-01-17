import { expect } from "chai";
import { describe } from "mocha";
import { JOURNEY_TYPE } from "../../../../app.constants";
import { getJourneyTypeFromUserSession } from "../journey";

describe("journey", () => {
  describe("getJourneyTypeFromUserSession", () => {
    it("should return undefined by default", () => {
      const journeyType = getJourneyTypeFromUserSession({});
      expect(journeyType).to.equal(undefined);
    });
    it("should return REAUTHENTICATE when user session includes `reauthenticate`", () => {
      const journeyType = getJourneyTypeFromUserSession({
        reauthenticate: "test_data",
      });
      expect(journeyType).to.equal(JOURNEY_TYPE.REAUTHENTICATION);
    });
  });
});
