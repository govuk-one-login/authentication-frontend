declare namespace Express {
  import type pino from "pino";
  interface Request {
    i18n?: { language?: string };
    t: TFunction;
    csrfToken?: () => string;
    log: pino.Logger;
    generatedSessionId?: string;
  }
}
