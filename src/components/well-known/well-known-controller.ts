import type { Request, Response } from "express";
import { getAppEnv } from "../../config.js";
import { APP_ENV_NAME } from "../../app.constants.js";

export function appleAppSiteAssociationGet(
  req: Request,
  res: Response
): Response {
  if ([APP_ENV_NAME.PROD, APP_ENV_NAME.INT].includes(getAppEnv())) {
    return res.status(404).send();
  }

  res.setHeader("Content-Type", "application/json");
  return res.json({
    applinks: {
      apps: [],
      details: [],
    },
    webcredentials: {
      apps: ["N8W395F695.uk.gov.govuk.dev", "N8W395F695.uk.gov.govuk"],
    },
  });
}
