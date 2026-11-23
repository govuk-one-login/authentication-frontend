import { expect } from "chai";
import { describe, it } from "mocha";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseStatusBannerSetting } from "../../../src/components/common/status-banner/status-banner-setting.js";
import { parseStatusBannerShowingTimes } from "../../../src/components/common/status-banner/status-banner-showing-times.js";

describe("deploy template status banner values", () => {
  const template = readFileSync(
    join(process.cwd(), "cloudformation/deploy/template.yaml"),
    "utf8"
  );

  function mappingValues(key: string): string[] {
    return [
      ...template.matchAll(new RegExp(`^\\s+${key}:\\s*(.*)$`, "gm")),
    ].map(([, raw]) => raw.trim().replace(/^["']|["']$/g, ""));
  }

  const environmentCount = mappingValues("PasskeyPromptClientDenyList").length;
  const statusBanners = mappingValues("StatusBanner");
  const showFromTimes = mappingValues("StatusBannerShowFrom");
  const showUntilTimes = mappingValues("StatusBannerShowUntil");

  ["StatusBanner", "StatusBannerShowFrom", "StatusBannerShowUntil"].forEach(
    (key) => {
      it(`should define ${key} for every environment`, () => {
        expect(environmentCount).to.be.greaterThan(0);
        expect(mappingValues(key)).to.have.length(environmentCount);
      });
    }
  );

  it("should only contain valid status banner entries", () => {
    statusBanners.forEach((value) => {
      expect(
        parseStatusBannerSetting(value).invalidEntries,
        `invalid StatusBanner '${value}'`
      ).to.be.empty;
    });
  });

  it("should only contain valid showing times", () => {
    showFromTimes.forEach((showFrom, environmentIndex) => {
      const showUntil = showUntilTimes[environmentIndex];
      expect(
        parseStatusBannerShowingTimes(
          showFrom || undefined,
          showUntil || undefined
        ).problems,
        `invalid StatusBannerShowFrom '${showFrom}' or StatusBannerShowUntil '${showUntil}'`
      ).to.be.empty;
    });
  });
});
