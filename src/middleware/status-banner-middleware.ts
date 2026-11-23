import type { NextFunction, Request, Response } from "express";
import { getStatusBanner } from "../config.js";
import {
  getStatusBannerScenario,
  isShownOnPath,
} from "../components/common/status-banner/scenarios.js";
import { logger } from "../utils/logger.js";

const alreadyReportedUnknownScenarioIds = new Set<string>();

function reportUnknownScenarioOnce(scenarioId: string): void {
  if (alreadyReportedUnknownScenarioIds.has(scenarioId)) {
    return;
  }
  alreadyReportedUnknownScenarioIds.add(scenarioId);
  logger.warn(
    `STATUS_BANNER is set to unknown scenario '${scenarioId}', so no status banner will be shown`
  );
}

export function statusBannerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const scenarioId = getStatusBanner();
  const scenario = scenarioId ? getStatusBannerScenario(scenarioId) : undefined;

  if (scenarioId && !scenario) {
    reportUnknownScenarioOnce(scenarioId);
  }

  if (scenario && isShownOnPath(scenario, req.path)) {
    res.locals.statusBanner = {
      component: scenario.component,
      translationKeyPrefix: scenario.translationKeyPrefix,
    };
  }

  next();
}
