const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.config.truncateThreshold = 0;
const { expect } = chai;

const { describe, it } = require("mocha");
const jose = require("jose");

describe("environment", function () {
  const requiredEnvVars = [
    "TEST_CLIENT_ID",
    "API_KEY",
    "SMARTAGENT_API_KEY",
    "SMARTAGENT_API_URL",
    "SMARTAGENT_WEBFORM_ID",
    "URL_FOR_SUPPORT_LINKS",
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
      await expect(jose.importSPKI(key, "ES256"), "jose could not import the PEM. Other failing tests may help you identify why").to.not.be.rejected;
    });

    it("should not contain '\\n'", function () {
      if (key === undefined) return this.skip();
      expect(key).to.not.contain("\\n"); //this is a string literal, not a newline character
    });
  });
});
