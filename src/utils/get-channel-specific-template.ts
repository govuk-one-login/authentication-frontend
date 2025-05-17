import type { MobileAndStrategicAppRoutes } from "src/app.constants.js";
import { logger } from "./logger.js";

export function getChannelSpecificTemplate(
  webTemplateAndPath: string,
  isStrategicAppChannel: boolean,
  isMobileAppChannel: boolean,
  templateMappings: Record<string, MobileAndStrategicAppRoutes>
): string {
  if (!isStrategicAppChannel && !isMobileAppChannel) {
    return webTemplateAndPath;
  }

  const appAndMobileTemplates = templateMappings[webTemplateAndPath];
  if (appAndMobileTemplates === undefined) {
    logger.warn(
      `No '${webTemplateAndPath}' property found in templateMappings. Falling back to web template`
    );
    return webTemplateAndPath;
  }

  if (isStrategicAppChannel) {
    return appAndMobileTemplates.strategicApp;
  }

  return appAndMobileTemplates.mobile;
}
