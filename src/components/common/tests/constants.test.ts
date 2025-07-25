import { describe } from "mocha";
import { expect } from "chai";
import { getNextPathAndUpdateJourney } from "../constants.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { USER_JOURNEY_EVENTS } from "../state-machine/state-machine.js";

describe("constants", () => {
  it("should error when the next path is the same as the initial path", async () => {
    const req = createMockRequest(PATH_NAMES.UPLIFT_JOURNEY);

    try {
      await getNextPathAndUpdateJourney(
        req,
        PATH_NAMES.ENTER_MFA,
        USER_JOURNEY_EVENTS.VERIFY_MFA
      );
      expect.fail("Expected function to throw");
    } catch (error) {
      expect(error.message).to.equal(
        "Invalid state transition: Event 'VERIFY_MFA' is not valid for state '/enter-code' with sessionId undefined"
      );
    }
  });
});
