import helmet from "helmet";
import { Request, Response } from "express";
// Helmet does not export the config type - This is the way the recommend getting it on GitHub.
export const helmetConfiguration: Parameters<typeof helmet>[0] = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        (req: Request, res: Response): string =>
          `'nonce-${res.locals.scriptNonce}'`,
        "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://ssl.google-analytics.com",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
      ],
      objectSrc: ["'none'"],
      connectSrc: ["'self'", "https://www.google-analytics.com"],
    },
  },
  dnsPrefetchControl: {
    allow: false,
  },
  frameguard: {
    action: "deny",
  },
  hsts: {
    maxAge: 31536000, // 1 Year
    preload: false,
    includeSubDomains: true,
  },
  referrerPolicy: false,
  permittedCrossDomainPolicies: false,
  expectCt: false,
};
