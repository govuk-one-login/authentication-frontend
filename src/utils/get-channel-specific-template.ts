import { logger } from "./logger.js";
export function getChannelSpecificTemplate(
  webTemplateAndPath: string,
  isApp: boolean,
  templateMappings: Record<string, string>
): string {
  if (!isApp) {
    return webTemplateAndPath;
  }

  const appTemplate = templateMappings[webTemplateAndPath];
  if (appTemplate === undefined) {
    logger.warn(
      `No '${webTemplateAndPath}' property found in templateMappings. Falling back to web template`
    );
    return webTemplateAndPath;
  }
  return appTemplate;
}
