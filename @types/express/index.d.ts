declare namespace Express {
  interface Request {
    useragent?: any;
    i18n?: {
      language?: string;
    };
    t: TFunction;
    csrfToken?: () => string;
    session: any;
  }
}
