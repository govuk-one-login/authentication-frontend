import { expect } from "chai";
import { describe } from "mocha";
import {
  isLocked,
  timestampNMinutesFromNow,
  timestampNSecondsFromNow,
} from "../../../src/utils/lock-helper.js";
import sinon from "sinon";
describe("lockout-helper", () => {
  let clock: sinon.SinonFakeTimers;
  const date = new Date(Date.UTC(2024, 1, 1));
  before(() => {
    clock = sinon.useFakeTimers({ now: date.valueOf(), shouldAdvanceTime: true });
  });

  after(() => {
    clock.restore();
  });

  describe("timestampNMinutesFromNow", () => {
    it("should return the correct timestamp from the current datetime", () => {
      const TEST_SCENARIO_PARAMS = [
        { numberOfMinutes: 1, expectedTimestamp: "Thu, 01 Feb 2024 00:01:00 GMT" },
        { numberOfMinutes: 60, expectedTimestamp: "Thu, 01 Feb 2024 01:00:00 GMT" },
      ];

      TEST_SCENARIO_PARAMS.forEach((params) => {
        expect(timestampNMinutesFromNow(params.numberOfMinutes)).to.eq(
          params.expectedTimestamp
        );
      });
    });
  });

  describe("timestampNSecondsFromNow", () => {
    it("should return the correct timestamp from the current datetime", () => {
      const TEST_SCENARIO_PARAMS = [
        { numberOfSeconds: 60, expectedTimestamp: "Thu, 01 Feb 2024 00:01:00 GMT" },
        { numberOfSeconds: 1, expectedTimestamp: "Thu, 01 Feb 2024 00:00:01 GMT" },
      ];

      TEST_SCENARIO_PARAMS.forEach((params) => {
        expect(timestampNSecondsFromNow(params.numberOfSeconds)).to.eq(
          params.expectedTimestamp
        );
      });
    });
  });

  describe("checkIfLocked", () => {
    it("should correctly determine if a user is locked", () => {
      const TEST_SCENARIO_PARAMS = [
        {
          lockoutExpiry: new Date(date.getTime() + 1 * 60000).toUTCString(),
          expectedLockedOut: true,
        },
        {
          lockoutExpiry: new Date(date.getTime() - 1 * 60000).toUTCString(),
          expectedLockedOut: false,
        },
        { lockoutExpiry: undefined, expectedLockedOut: undefined },
        { lockoutExpiry: date.toUTCString(), expectedLockedOut: false },
      ];

      TEST_SCENARIO_PARAMS.forEach((params) => {
        expect(isLocked(params.lockoutExpiry)).to.eq(params.expectedLockedOut);
      });
    });
  });
});
