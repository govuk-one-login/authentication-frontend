import type { NextFunction, Request, Response } from "express";
import { getStatusBanner } from "../config.js";
import { isShownOnPath } from "../components/common/status-banner/scenarios.js";
import type { InvalidStatusBannerEntry } from "../components/common/status-banner/status-banner-setting.js";
import { parseStatusBannerSetting } from "../components/common/status-banner/status-banner-setting.js";
import { logger } from "../utils/logger.js";

const alreadyReportedInvalidEntries = new Set<string>();

function reportInvalidEntryOnce({
  entry,
  reason,
}: InvalidStatusBannerEntry): void {
  const reportKey = `${entry}: ${reason}`;
  if (alreadyReportedInvalidEntries.has(reportKey)) {
    return;
  }
  alreadyReportedInvalidEntries.add(reportKey);
  logger.warn(
    `Ignoring STATUS_BANNER entry '${entry}' (${reason}), so it will not be shown`
  );
}

export function statusBannerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { banners, invalidEntries } =
    parseStatusBannerSetting(getStatusBanner());
  invalidEntries.forEach(reportInvalidEntryOnce);

  const scenariosForPage = banners
    .map((banner) => banner.scenario)
    .filter((scenario) => isShownOnPath(scenario, req.path));

  if (scenariosForPage.length > 0) {
    res.locals.statusBanners = {
      notificationBannerKeyPrefixes: scenariosForPage
        .filter((scenario) => scenario.component === "notification-banner")
        .map((scenario) => scenario.translationKeyPrefix),
      warningTextKeyPrefixes: scenariosForPage
        .filter((scenario) => scenario.component === "warning-text")
        .map((scenario) => scenario.translationKeyPrefix),
    };
  }

  next();
}
