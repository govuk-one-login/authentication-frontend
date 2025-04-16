import { afterEach, beforeEach, describe } from "mocha";
import { expect, sinon } from "../utils/test-utils";
import { shutdownProcess, startServer } from "../../src/app";
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

      const { closeServer } = await startServer(app);

      expect(listenSpy).to.be.calledOnceWith(process.env.PORT);

      await closeServer();
    });

    it("should start server with expected timeouts", async () => {
      const app = express();

      const { server, closeServer } = await startServer(app);

      expect(server.keepAliveTimeout).to.be.eq(61 * 1000);
      expect(server.headersTimeout).to.be.eq(91 * 1000);

      await closeServer();
    });

    it("should start server with vital-signs package", async () => {
      decache("../../src/app");
      decache("@govuk-one-login/frontend-vital-signs");
      const frontendVitalSigns = require("@govuk-one-login/frontend-vital-signs");
      sinon
        .stub(frontendVitalSigns, "frontendVitalSignsInit")
        .callsFake(() => () => {});
      const { startServer } = require("../../src/app");
      const app = express();

      const { server, closeServer } = await startServer(app);

      expect(frontendVitalSigns.frontendVitalSignsInit).to.be.calledOnceWith(
        server,
        { staticPaths: [/^\/assets\/.*/, /^\/public\/.*/], interval: 10000 }
      );
      await closeServer();
    });

    it("should close server properly", async () => {
      decache("../../src/app");
      decache("../../src/config/session");
      decache("@govuk-one-login/frontend-vital-signs");
      const frontendVitalSigns = require("@govuk-one-login/frontend-vital-signs");
      const session = require("../../src/config/session");
      const stopVitalSigns = sinon.fake(() => {});
      sinon
        .stub(frontendVitalSigns, "frontendVitalSignsInit")
        .callsFake(() => stopVitalSigns);
      sinon.stub(session, "disconnectRedisClient").callsFake(() => {});
      const { startServer } = require("../../src/app");
      const app = express();
      const { closeServer } = await startServer(app);

      await closeServer();

      expect(session.disconnectRedisClient).to.be.callCount(1);
      expect(stopVitalSigns).to.be.callCount(1);
    });
  });

  describe("shutdownProcess", () => {
    let exitStub: () => void;
    beforeEach(() => {
      exitStub = sinon.stub(process, "exit");
    });
    afterEach(() => {
      sinon.restore();
    });
    it("will execute the closeServer callback before exiting successfully", async () => {
      const callback = sinon.fake();
      await shutdownProcess(callback)();
      expect(callback).to.be.callCount(1);
      expect(exitStub).to.be.calledOnceWith(0);
    });

    it("will exit with error if callback throw an error", async () => {
      const callback = sinon.fake(() => {
        throw new Error("Something unexpected happened");
      });
      await shutdownProcess(callback)();
      expect(exitStub).to.be.calledOnceWith(1);
    });
  });

  describe("applyOverloadProtection", () => {
    beforeEach(() => {
      decache("../../src/app");
      sinon.stub(require("../../src/utils/redis"), "getRedisConfig").returns({
        host: "redis-host",
        port: Number("1234"),
        password: "redis-password",
        tls: true,
      });
      process.env.REDIS_KEY = "redis-key";
    });

    afterEach(() => {
      sinon.restore();
      delete process.env.REDIS_KEY;
      delete process.env.APP_ENV;
    });

    it("should not call applyOverloadProtection when the environment isn't staging", async () => {
      process.env.APP_ENV = "production";

      const app = await require("../../src/app").createApp();

      const hasOverloadProtection = app._router.stack.some(
        (layer: { name: string }) => layer.name === "overloadProtection"
      );
      expect(hasOverloadProtection).to.eq(false);
    });

    it("should applyOverloadProtection when the environment is staging", async () => {
      process.env.APP_ENV = "staging";

      const app = await require("../../src/app").createApp();

      const hasOverloadProtection = app._router.stack.some(
        (layer: { name: string }) => layer.name === "overloadProtection"
      );
      expect(hasOverloadProtection).to.eq(true);
    });
  });
});
