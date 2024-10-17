import { beforeEach, describe } from "mocha";
import { expect, sinon } from "../utils/test-utils";
import { startServer } from "../../src/app";
import express from "express";
import decache from "decache";

describe("app", () => {
  describe("startServer", () => {
    beforeEach(() => {
      process.env.PORT = "3060";
    });

    it("should start server on expected port", async () => {
      const app = express();
      const listenSpy = sinon.spy(app, "listen");
      const server = await startServer(app);
      expect(listenSpy).to.be.calledOnceWith(process.env.PORT);
      server.close();
    });

    it("should start server with expected timeouts", async () => {
      const app = express();
      const server = await startServer(app);
      expect(server.keepAliveTimeout).to.be.eq(61 * 1000);
      expect(server.headersTimeout).to.be.eq(91 * 1000);
      server.close();
    });

    it("should start server with vital-signs package", async () => {
      decache("../../src/app");
      decache("@govuk-one-login/frontend-vital-signs");
      const frontendVitalSigns = require("@govuk-one-login/frontend-vital-signs");
      sinon
        .stub(frontendVitalSigns, "frontendVitalSignsInit")
        .callsFake(() => {});
      const { startServer } = require("../../src/app");
      const app = express();
      const server = await startServer(app);
      expect(frontendVitalSigns.frontendVitalSignsInit).to.be.calledOnceWith(
        server,
        { staticPaths: [/^\/assets\/.*/, /^\/public\/.*/] }
      );
      server.close();
    });
  });
});
