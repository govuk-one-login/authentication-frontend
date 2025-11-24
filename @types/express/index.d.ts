import type pino from "pino";
import type { Taxonomy } from "../utils/taxonomy.ts";

declare global {
  namespace Express {
    export interface Request {
      i18n: {
        language: string;
        // frontendUiMiddleware from the @govuk-one-login/frontend-ui package accesses properties directly (req.i18n.store.data).
        // Therefore, store and data must be defined as required here to match the middleware signature.
        store: {
          data: Record<string, any>;
        };
      };
      t: TFunction;
      csrfToken?: () => string;
      log: pino.Logger;
      generatedSessionId?: string;
    }

    export interface Locals {
      // Session IDs
      sessionId?: string;
      clientSessionId?: string;
      persistentSessionId?: string;
      clientId?: string;

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
