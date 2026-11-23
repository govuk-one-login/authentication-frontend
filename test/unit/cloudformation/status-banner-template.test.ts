import { expect } from "chai";
import { describe, it } from "mocha";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseStatusBannerSetting } from "../../../src/components/common/status-banner/status-banner-setting.js";

describe("deploy template StatusBanner values", () => {
  const template = readFileSync(
    join(process.cwd(), "cloudformation/deploy/template.yaml"),
    "utf8"
  );
  const values = [...template.matchAll(/^\s+StatusBanner:\s*(.*)$/gm)].map(
    ([, raw]) => raw.trim().replace(/^["']|["']$/g, "")
  );

  it("should define StatusBanner for every environment", () => {
    expect(values.length).to.be.greaterThan(0);
    expect(values.length).to.equal(
      [...template.matchAll(/^\s+PasskeyPromptClientDenyList:/gm)].length
    );
  });

  it("should only contain valid status banner entries", () => {
    values.forEach((value) => {
      expect(
        parseStatusBannerSetting(value).invalidEntries,
        `invalid StatusBanner '${value}'`
      ).to.be.empty;
    });
  });
});
