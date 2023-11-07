import helmet from "helmet";
import e, { Request, Response } from "express";
import { supportFrameAncestorsFormActionsCspHeaders } from "../config";
// Helmet does not export the config type - This is the way the recommend getting it on GitHub.
export function helmetConfiguration(): Parameters<typeof helmet>[0] {
  let helmetConfig: {
    permittedCrossDomainPolicies: boolean;
    referrerPolicy: boolean;
    expectCt: boolean;
    frameguard: { action: string };
    hsts: { maxAge: number; includeSubDomains: boolean; preload: boolean };
    dnsPrefetchControl: { allow: boolean };
    contentSecurityPolicy: {
      directives: {
        defaultSrc: string[];
        objectSrc: string[];
        styleSrc: string[];
        scriptSrc: (string | ((req: e.Request, res: e.Response) => string))[];
        imgSrc: string[];
        connectSrc: string[];
        "form-action"?: string[];
        "frame-ancestors"?: string[]
      }
    }
  };
  helmetConfig = {
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
    expectCt: false,
    frameguard: {
      action: "deny",
    },
    hsts: {
      maxAge: 31536000, // 1 Year
      preload: true,
      includeSubDomains: true,
    },
    permittedCrossDomainPolicies: false,
    referrerPolicy: false,
  };
  if (supportFrameAncestorsFormActionsCspHeaders()) {
    helmetConfig.contentSecurityPolicy.directives["frame-ancestors"] = [
      "'self'",
      "https://*.account.gov.uk",
    ];
    helmetConfig.contentSecurityPolicy.directives["form-action"] = [
      "'self'",
      "https://*.account.gov.uk",
    ];
  }
  return helmetConfig;
}
