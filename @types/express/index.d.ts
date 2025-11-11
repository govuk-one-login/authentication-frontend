import type pino from "pino";
import type { Taxonomy } from "../utils/taxonomy.ts";

declare global {
  namespace Express {
    export interface Request {
      i18n?: {
        language?: string;
      };
      t: TFunction;
      csrfToken?: () => string;
      log: pino.Logger;
      generatedSessionId?: string;
    }

    export interface Locals {
      // Session IDs
      sessionId?: string;
      persistentSessionId?: string;

      // Security
      scriptNonce?: string;
      csrfToken?: string;

      // Analytics
      ga4ContainerId?: string;
      isGa4Enabled?: string;
      analyticsCookieDomain?: string;
      analyticsProperties?: {
        httpStatusCode: number;
        contentId: string;
        taxonomy: Taxonomy;
      };

      // Language
      languageToggleEnabled?: boolean;
      language?: string;
      htmlLang?: string;

      // App
      strategicAppChannel?: boolean;
      webChannel?: boolean;
      genericAppChannel?: boolean;
      isApp?: boolean;

      // Feature flags
      supportPasskeyUsage?: boolean;
      supportPasskeyRegistration?: boolean;
      enableDwpKbvContactFormChanges?: boolean;

      // Misc
      currentUrl?: URL;
      showTestBanner?: boolean;
      accountManagementUrl?: string;
      contactUsLinkUrl?: string;
    }
  }
}
