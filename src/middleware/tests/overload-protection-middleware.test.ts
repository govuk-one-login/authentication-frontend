import { describe } from "mocha";
import { expect, sinon } from "../../../test/utils/test-utils.js";
import esmock from "esmock";

describe("applyOverloadProtection", () => {
  let overloadProtectionStub: any;
  let applyOverloadProtection: any;

  beforeEach(async () => {
    overloadProtectionStub = sinon.stub();

    ({ applyOverloadProtection } = await esmock("../overload-protection-middleware.js", {
      "overload-protection": {
        default: overloadProtectionStub,
      },
    }));
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
