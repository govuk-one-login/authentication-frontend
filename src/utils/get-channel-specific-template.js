import { logger } from "./logger";
export function getChannelSpecificTemplate(webTemplateAndPath, isStrategicAppChannel, templateMappings) {
    if (!isStrategicAppChannel) {
        return webTemplateAndPath;
    }
    const appTemplate = templateMappings[webTemplateAndPath];
    if (appTemplate === undefined) {
        logger.warn(`No '${webTemplateAndPath}' property found in templateMappings. Falling back to web template`);
        return webTemplateAndPath;
    }
    return appTemplate;
}
