import { afterEach, beforeEach, describe } from "mocha";
import { expect, sinon } from "../utils/test-utils.js";
import { shutdownProcess, startServer } from "../../src/app.js";
import express from "express";
import esmock from "esmock";

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
      const fakeFrontendVitalSignsInit = sinon.fake();
      const { startServer } = await esmock("../../src/app.js", {
        "@govuk-one-login/frontend-vital-signs": {
          frontendVitalSignsInit: fakeFrontendVitalSignsInit,
        },
      });

      const app = express();

      const { server, closeServer } = await startServer(app);

      expect(fakeFrontendVitalSignsInit).to.be.calledOnceWith(
        server,
        { staticPaths: [/^\/assets\/.*/, /^\/public\/.*/], interval: 10000 }
      );
      await closeServer();
    });

    it("should close server properly", async () => {
      const fakeFrontendVitalSignsInit = sinon.fake();
      const fakeDisconnectRedisClient = sinon.fake();

      const { startServer } = await esmock("../../src/app.js", {
        "@govuk-one-login/frontend-vital-signs": {
          frontendVitalSignsInit: fakeFrontendVitalSignsInit,
        },
        "../../src/config/session.js": {
          disconnectRedisClient: fakeDisconnectRedisClient,
        },
      });

      const app = express();
      const { closeServer } = await startServer(app);

      await closeServer();

      expect(fakeDisconnectRedisClient).to.be.callCount(1);
      expect(fakeFrontendVitalSignsInit).to.be.callCount(1);
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
    let createApp: () => Promise<express.Application>;

    beforeEach(async () => {
      ({ createApp } = await esmock("../../src/app.js", {
        "../../src/utils/redis.js": {
          getRedisConfig: sinon.fake.resolves({
            host: "redis-host",
            port: Number("1234"),
            password: "redis-password",
            tls: true,
          }),
        },
      }));

      process.env.REDIS_KEY = "redis-key";
    });

    afterEach(() => {
      delete process.env.REDIS_KEY;
      delete process.env.APP_ENV;
    });

    it("should not call applyOverloadProtection when the environment isn't staging", async () => {
      process.env.APP_ENV = "production";

      const app = await createApp();

      const hasOverloadProtection = app._router.stack.some(
        (layer: { name: string }) => layer.name === "overloadProtection"
      );
      expect(hasOverloadProtection).to.eq(false);
    });

    it("should applyOverloadProtection when the environment is staging", async () => {
      process.env.APP_ENV = "staging";

      const app = await createApp();

      const hasOverloadProtection = app._router.stack.some(
        (layer: { name: string }) => layer.name === "overloadProtection"
      );
      expect(hasOverloadProtection).to.eq(true);
    });
  });
});
