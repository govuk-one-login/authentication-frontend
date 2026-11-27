import type { StatusBannerScenario } from "./scenarios.js";
import { getStatusBannerScenario } from "./scenarios.js";

export const SCENARIO_SEPARATOR = ",";

export interface ConfiguredStatusBanner {
  scenarioId: string;
  scenario: StatusBannerScenario;
}

export interface InvalidStatusBannerEntry {
  entry: string;
  reason: string;
}

export interface ParsedStatusBannerSetting {
  banners: ConfiguredStatusBanner[];
  invalidEntries: InvalidStatusBannerEntry[];
}

export function parseStatusBannerSetting(
  setting: string | undefined
): ParsedStatusBannerSetting {
  const entries = (setting ?? "")
    .split(SCENARIO_SEPARATOR)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  const banners: ConfiguredStatusBanner[] = [];
  const invalidEntries: InvalidStatusBannerEntry[] = [];

  entries.forEach((entry) => {
    const scenarioId = entry;
    const scenario = getStatusBannerScenario(scenarioId);

    if (!scenario) {
      invalidEntries.push({ entry, reason: "unknown scenario" });
    } else if (banners.some((banner) => banner.scenarioId === scenarioId)) {
      invalidEntries.push({ entry, reason: "scenario listed more than once" });
    } else {
      banners.push({ scenarioId, scenario });
    }
  });

  return { banners, invalidEntries };
}
