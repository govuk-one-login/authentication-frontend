import { expect } from "chai";
import { describe } from "mocha";
import { timestampNMinutesFromNow } from "../../../src/utils/lock-helper";
import sinon from "sinon";
describe("lockout-helper", () => {
  describe("timestampNMinutesFromNow", () => {
    let clock: sinon.SinonFakeTimers;
    afterEach(() => {
      clock.restore();
    });
    it("should return the correct timestamp from the current datetime", () => {
      const date = new Date(2024, 1, 1);
      clock = sinon.useFakeTimers({
        now: date.valueOf(),
        shouldAdvanceTime: true,
      });

      const TEST_SCENARIO_PARAMS = [
        {
          numberOfMinutes: 1,
          expectedTimestamp: "Thu, 01 Feb 2024 00:01:00 GMT",
        },
        {
          numberOfMinutes: 60,
          expectedTimestamp: "Thu, 01 Feb 2024 01:00:00 GMT",
        },
      ];

      TEST_SCENARIO_PARAMS.forEach((params) => {
        expect(timestampNMinutesFromNow(params.numberOfMinutes)).to.eq(
          params.expectedTimestamp
        );
      });
    });
  });
});
