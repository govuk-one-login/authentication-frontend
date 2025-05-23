import { logger } from "./logger.js";
export function getChannelSpecificErrorMessage(
  webMessage: string,
  isAnAppChannel: boolean,
  messageMappings: Record<string, string>
): string {
  if (!isAnAppChannel) {
    return webMessage;
  }

  const appMessage: string = messageMappings[webMessage];

  if (appMessage === undefined) {
    logger.warn(
      `No '${webMessage}' property found in messageMappings. Falling back to webMessage`
    );
    return webMessage;
  }
  return appMessage;
}
