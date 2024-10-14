import { logger } from "./logger";

export function getChannelSpecificTemplate(
  webTemplateAndPath: string,
  isStrategicAppChannel: boolean,
  templateMappings: Record<string, string>
): string {
  if (isStrategicAppChannel === true) {
    const templateHasMapping = Object.prototype.hasOwnProperty.call(
      templateMappings,
      webTemplateAndPath
    );

    if (templateHasMapping) {
      return templateMappings[webTemplateAndPath];
    }
    logger.warn(
      `No '${webTemplateAndPath}' property found in templateMappings. Falling back to web template`
    );
  }
  return webTemplateAndPath;
}
