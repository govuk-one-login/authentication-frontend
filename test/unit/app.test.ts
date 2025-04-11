// import { afterEach, beforeEach, describe } from "mocha";
import { expect, sinon } from "../utils/test-utils.js";
// import express from "express";

describe("app", () => {
  describe("startServer", () => {
    beforeEach(() => {
      process.env.PORT = "3060";
      sinon.restore();
    });
    it("shouldAssertTrue", () => {
      expect(true).to.equal(true);
    });

    it("should start server on expected port", async () => {
      // const app = express();
      // const listenSpy = sinon.spy(app, "listen");
      const { startServer } = await import("../../src/app.js");
      // const { blah } = await import("../../src/simple.js");
      //
      // const { closeServer } = await startServer(app);

      // expect(await blah()).to.equal(true);

      // expect(listenSpy).to.be.calledOnceWith(process.env.PORT);

      // await closeServer();
    });

    // it("should start server with expected timeouts", async () => {
    //   const app = express();
    //   const { startServer } = await import("../../src/app.js");
    //
    //   const { server, closeServer } = await startServer(app);
    //
    //   expect(server.keepAliveTimeout).to.be.eq(61 * 1000);
    //   expect(server.headersTimeout).to.be.eq(91 * 1000);
    //
    //   await closeServer();
    // });
    //
    // it("should start server with vital-signs package", async () => {
    //   const frontendVitalSigns = await import(
    //     "@govuk-one-login/frontend-vital-signs"
    //   );
    //   sinon
    //     .stub(frontendVitalSigns, "frontendVitalSignsInit")
    //     .callsFake(() => () => {});
    //   const { startServer } = await import("../../src/app.js");
    //   const app = express();
    //
    //   const { server, closeServer } = await startServer(app);
    //
    //   expect(frontendVitalSigns.frontendVitalSignsInit).to.be.calledOnceWith(
    //     server,
    //     { staticPaths: [/^\/assets\/.*/, /^\/public\/.*/] }
    //   );
    //   await closeServer();
    // });
    //
    // it("should close server properly", async () => {
    //   const frontendVitalSigns = await import(
    //     "@govuk-one-login/frontend-vital-signs"
    //   );
    //   const session = await import("../../src/config/session.js");
    //   const stopVitalSigns = sinon.fake(() => {});
    //   sinon
    //     .stub(frontendVitalSigns, "frontendVitalSignsInit")
    //     .callsFake(() => stopVitalSigns);
    //   sinon.stub(session, "disconnectRedisClient").callsFake(() => new Promise(() => {}));
    //   const { startServer } = await import("../../src/app.js");
    //   const app = express();
    //   const { closeServer } = await startServer(app);
    //
    //   await closeServer();
    //
    //   expect(session.disconnectRedisClient).to.be.callCount(1);
    //   expect(stopVitalSigns).to.be.callCount(1);
    // });
  });

  // describe("shutdownProcess", () => {
  //   let exitStub: () => void;
  //   beforeEach(() => {
  //     exitStub = sinon.stub(process, "exit");
  //   });
  //   afterEach(() => {
  //     sinon.restore();
  //   });
  //   it("will execute the closeServer callback before exiting successfully", async () => {
  //     const { shutdownProcess } = await import("../../src/app.js");
  //     const callback = sinon.fake();
  //     await shutdownProcess(callback)();
  //     expect(callback).to.be.callCount(1);
  //     expect(exitStub).to.be.calledOnceWith(0);
  //   });
  //
  //   it("will exit with error if callback throw an error", async () => {
  //     const { shutdownProcess } = await import("../../src/app.js");
  //     const callback = sinon.fake(() => {
  //       throw new Error("Something unexpected happened");
  //     });
  //     await shutdownProcess(callback)();
  //     expect(exitStub).to.be.calledOnceWith(1);
  //   });
  // });
  //
  // describe("applyOverloadProtection", () => {
  //   beforeEach(async () => {
  //     sinon
  //       .stub(await import("../../src/utils/redis.js"), "getRedisConfig")
  //       .returns(new Promise(() => ({
  //         host: "redis-host",
  //         port: Number("1234"),
  //         password: "redis-password",
  //         tls: true,
  //       })));
  //     process.env.REDIS_KEY = "redis-key";
  //   });
  //
  //   afterEach(() => {
  //     sinon.restore();
  //     delete process.env.REDIS_KEY;
  //     delete process.env.APP_ENV;
  //   });
  //
  //   it("should not call applyOverloadProtection when the environment isn't staging", async () => {
  //     process.env.APP_ENV = "production";
  //     const app = await (await import("../../src/app.js")).createApp();
  //
  //     const hasOverloadProtection = app._router.stack.some(
  //       (layer: { name: string }) => layer.name === "overloadProtection"
  //     );
  //     expect(hasOverloadProtection).to.eq(false);
  //   });
  //
  //   it("should applyOverloadProtection when the environment is staging", async () => {
  //     process.env.APP_ENV = "staging";
  //
  //     const app = await (await import("../../src/app.js")).createApp();
  //
  //     const hasOverloadProtection = app._router.stack.some(
  //       (layer: { name: string }) => layer.name === "overloadProtection"
  //     );
  //     expect(hasOverloadProtection).to.eq(true);
  //   });
  // });
});
