import { logger } from "./logger";
export function getChannelSpecificErrorMessage(webMessage, isStrategicAppChannel, messageMappings) {
    if (!isStrategicAppChannel) {
        return webMessage;
    }
    const appMessage = messageMappings[webMessage];
    if (appMessage === undefined) {
        logger.warn(`No '${webMessage}' property found in messageMappings. Falling back to webMessage`);
        return webMessage;
    }
    return appMessage;
}
