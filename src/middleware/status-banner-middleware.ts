import type { NextFunction, Request, Response } from "express";
import {
  getStatusBanner,
  getStatusBannerShowFrom,
  getStatusBannerShowUntil,
} from "../config.js";
import { isShownOnPath } from "../components/common/status-banner/scenarios.js";
import { parseStatusBannerSetting } from "../components/common/status-banner/status-banner-setting.js";
import {
  isShowingAt,
  parseStatusBannerShowingTimes,
} from "../components/common/status-banner/status-banner-showing-times.js";
import { logger } from "../utils/logger.js";

const alreadyReportedProblems = new Set<string>();

function reportProblemOnce(problem: string): void {
  if (alreadyReportedProblems.has(problem)) {
    return;
  }
  alreadyReportedProblems.add(problem);
  logger.warn(`Status banner configuration problem: ${problem}`);
}

export function statusBannerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { banners, invalidEntries } =
    parseStatusBannerSetting(getStatusBanner());
  invalidEntries.forEach(({ entry, reason }) =>
    reportProblemOnce(
      `ignoring STATUS_BANNER entry '${entry}' because of ${reason}`
    )
  );

  const showingTimes = parseStatusBannerShowingTimes(
    getStatusBannerShowFrom(),
    getStatusBannerShowUntil()
  );
  showingTimes.problems.forEach((problem) =>
    reportProblemOnce(`${problem}, so no status banner will be shown`)
  );

  const scenariosForPage = isShowingAt(showingTimes, new Date())
    ? banners
        .map((banner) => banner.scenario)
        .filter((scenario) => isShownOnPath(scenario, req.path))
    : [];

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
