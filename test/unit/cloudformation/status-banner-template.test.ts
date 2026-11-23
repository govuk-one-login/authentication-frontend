import { expect } from "chai";
import { describe, it } from "mocha";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { STATUS_BANNER_SCENARIOS } from "../../../src/components/common/status-banner/scenarios.js";

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

  it("should only use empty values or known scenario ids", () => {
    const validValues = ["", ...Object.keys(STATUS_BANNER_SCENARIOS)];
    values.forEach((value) => {
      expect(validValues, `unknown StatusBanner '${value}'`).to.include(value);
    });
  });
});
