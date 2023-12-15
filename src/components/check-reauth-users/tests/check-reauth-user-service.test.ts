import { expect } from "chai";
import { describe } from "mocha";

import { supportReauthentication } from "../../../config";

describe("re-authentication service", () => {
  describe("with auth re-authentication feature flag on", () => {
    it("should return true", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "1";

      expect(supportReauthentication()).to.be.true;
    });
  });

  describe("with auth re-authentication feature flag off", () => {
    it("should return false", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "0";

      expect(supportReauthentication()).to.be.false;
    });
  });
});
