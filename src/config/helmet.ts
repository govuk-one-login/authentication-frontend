import type { HelmetOptions } from "helmet";
import type { Response } from "express";
import type { IncomingMessage } from "http";
import type { ServerResponse } from "http";

export const helmetConfiguration: HelmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        (req: IncomingMessage, res: ServerResponse): string =>
          // In our app this will always be an express response
          `'nonce-${(res as Response).locals.scriptNonce}'`,
        "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='",
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
