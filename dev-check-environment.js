import chai from "chai";
chai.config.truncateThreshold = 0;
const { expect } = chai;

import { describe, it } from "mocha";
import * as jose from "jose";

describe("environment", function () {
  const requiredEnvVars = [
    "TEST_CLIENT_ID",
    "API_KEY",
    "SMARTAGENT_API_KEY",
    "SMARTAGENT_API_URL",
    "SMARTAGENT_WEBFORM_ID",
    "URL_FOR_SUPPORT_LINKS",
    "STUB_HOSTNAME",
  ];

  requiredEnvVars.forEach((envVar) => {
    it(`$${envVar} should be defined`, function () {
      expect(process.env[envVar]).to.not.be.undefined;
    });
    it(`$${envVar} should not be empty`, function () {
      if (process.env[envVar] === undefined) return this.skip();
      expect(process.env[envVar]).to.not.be.empty;
    });
  });

  describe("$ORCH_TO_AUTH_SIGNING_KEY", async function () {
    const key = process.env.ORCH_TO_AUTH_SIGNING_KEY;
    it("should be defined", function () {
      expect(key).to.not.be.undefined;
    });
    it("should not be empty", function () {
      if (key === undefined) return this.skip();
      expect(key).to.not.be.empty;
    });

    it("should be importable by jose", async function () {
      if (key === undefined) return this.skip();
      try {
        await jose.importSPKI(key, "ES256");
      } catch (error) {
        expect.fail(
          `jose could not import the PEM. Other failing tests may help you identify why. Message: ${error.message}`
        );
      }
    });

    it("should not contain '\\n'", function () {
      if (key === undefined) return this.skip();
      expect(key).to.not.contain("\\n"); //this is a string literal, not a newline character
    });
  });
});
