import { logger } from "./logger";

export function redactEmail(email: string): string {
  if (email == null) {
    logger.error("attempted to redact empty email");
    return "";
  }
  const [localPart, domain] = email.split("@");
  if (domain === undefined || domain.length === 0 || localPart.length === 0) {
    logger.error("attempted to redact invalid email");
    return "";
  }
  return localPart[0] + "***@" + domain;
}
