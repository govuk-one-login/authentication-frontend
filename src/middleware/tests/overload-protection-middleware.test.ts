import { describe } from "mocha";
import { expect, sinon } from "../../../test/utils/test-utils.js";
describe("applyOverloadProtection", () => {
  let overloadProtectionStub: any;
  let applyOverloadProtection: any;

  beforeEach(() => {
    delete require.cache[require.resolve("overload-protection")];
    delete require.cache[require.resolve("../overload-protection-middleware")];

    overloadProtectionStub = sinon.stub();

    require.cache[require.resolve("overload-protection")] = {
      exports: overloadProtectionStub,
    } as NodeModule;

    applyOverloadProtection = (
      await import("../overload-protection-middleware")
    ).applyOverloadProtection;
  });

  it("should call overloadProtection with correct options in production mode", () => {
    const isProduction = true;
    applyOverloadProtection(isProduction);
    expect(overloadProtectionStub).to.be.calledOnceWith(
      "express",
      expectedOverloadProtectionConfig(true)
    );
  });

  it("should call overloadProtection with correct options in non-production mode", () => {
    const isProduction = false;
    applyOverloadProtection(isProduction);
    expect(overloadProtectionStub).to.be.calledOnceWith(
      "express",
      expectedOverloadProtectionConfig(false)
    );
  });
});

function expectedOverloadProtectionConfig(isProduction: boolean) {
  return {
    production: isProduction,
    clientRetrySecs: 3,
    sampleInterval: 10,
    maxEventLoopDelay: 700,
    maxHeapUsedBytes: 0,
    maxRssBytes: 0,
    errorPropagationMode: false,
    logging: "info",
    logStatsOnReq: false,
  };
}
