import { expect } from "chai";
import { describe, it } from "mocha";
import { parseStatusBannerSetting } from "../status-banner-setting.js";
import { STATUS_BANNER_SCENARIOS } from "../scenarios.js";

describe("parseStatusBannerSetting", () => {
  [undefined, "", "  ", ","].forEach((setting) => {
    it(`should return no banners for '${setting}'`, () => {
      expect(parseStatusBannerSetting(setting)).to.deep.equal({
        banners: [],
        invalidEntries: [],
      });
    });
  });

  it("should return a single scenario", () => {
    expect(parseStatusBannerSetting("sms-delays")).to.deep.equal({
      banners: [
        {
          scenarioId: "sms-delays",
          scenario: STATUS_BANNER_SCENARIOS["sms-delays"],
        },
      ],
      invalidEntries: [],
    });
  });

  it("should return several scenarios in the order they are listed", () => {
    const { banners, invalidEntries } = parseStatusBannerSetting(
      "service-issues, sms-delays"
    );

    expect(banners.map((banner) => banner.scenarioId)).to.deep.equal([
      "service-issues",
      "sms-delays",
    ]);
    expect(invalidEntries).to.be.empty;
  });

  it("should skip unknown scenarios but keep the valid ones", () => {
    const { banners, invalidEntries } = parseStatusBannerSetting(
      "sms-delayz,service-issues"
    );

    expect(banners.map((banner) => banner.scenarioId)).to.deep.equal([
      "service-issues",
    ]);
    expect(invalidEntries).to.deep.equal([
      { entry: "sms-delayz", reason: "unknown scenario" },
    ]);
  });

  it("should only show a scenario once when it is listed twice", () => {
    const { banners, invalidEntries } = parseStatusBannerSetting(
      "sms-delays,sms-delays"
    );

    expect(banners).to.have.length(1);
    expect(invalidEntries).to.deep.equal([
      { entry: "sms-delays", reason: "scenario listed more than once" },
    ]);
  });
});
