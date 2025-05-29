import type { HelmetOptions } from "helmet";
import type { Request, Response } from "express";

export const helmetConfiguration: HelmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        (req: Request, res: Response): string => `'nonce-${res.locals.scriptNonce}'`,
        "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='",
        "https://*.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://ssl.google-analytics.com",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://*.google-analytics.com",
        "https://*.googletagmanager.com",
        "https://www.google-analytics.com",
      ],
      objectSrc: ["'none'"],
      connectSrc: [
        "'self'",
        "https://*.google-analytics.com",
        "https://*.analytics.google.com",
        "https://*.googletagmanager.com",
        "https://www.google-analytics.com",
      ],
      frameAncestors: ["'self'", "https://*.account.gov.uk"],
      formAction: null,
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
    preload: true,
    includeSubDomains: true,
  },
  referrerPolicy: false,
  permittedCrossDomainPolicies: false,
};
