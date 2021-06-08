declare namespace Express {
  interface Request {
    i18n?: {
      language?: string;
    };
    t: TFunction;
    csrfToken?: () => string;
  }
}
