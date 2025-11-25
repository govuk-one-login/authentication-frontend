import type express from "express";
import nunjucks from "nunjucks";
import i18next from "i18next";
import { returnLastCharactersOnly } from "../utils/phone-number.js";
import { getNodeEnv, useRebrand } from "../config.js";
import { ENVIRONMENT_NAME } from "../app.constants.js";
import addLanguageParam from "@govuk-one-login/frontend-language-toggle";
import { logger } from "../utils/logger.js";

interface FilterContext {
  ctx: {
    htmlLang?: string;
    i18n?: {
      language?: string;
    };
  };
}

export function configureNunjucks(
  app: express.Application,
  viewsPath: string[]
): nunjucks.Environment {
  const nunjucksEnv: nunjucks.Environment = nunjucks.configure(viewsPath, {
    autoescape: true,
    express: app,
    noCache: getNodeEnv() !== ENVIRONMENT_NAME.PROD,
  });

  nunjucksEnv.addFilter(
    "translate",
    function (this: FilterContext, key: string, options?: any) {
      // const language = this.ctx.i18n?.language || this.ctx.htmlLang || i18next.resolvedLanguage || 'en';

      const ctxI18nLang = this.ctx.i18n?.language;
      const ctxHtmlLang = this.ctx.htmlLang;
      const i18nextResolved = i18next.resolvedLanguage;
      const language = ctxI18nLang || ctxHtmlLang || i18nextResolved || 'en';

      logger.debug({ ctxI18nLang, ctxHtmlLang, i18nextResolved, language, key }, 'translate filter');

      const translate = i18next.getFixedT(language);

      return translate(key, options);
    }
  );

  nunjucksEnv.addFilter(
    "returnLastCharacters",
    function (key: string, options?: any) {
      return returnLastCharactersOnly(key, options);
    }
  );

  nunjucksEnv.addGlobal("addLanguageParam", addLanguageParam);
  nunjucksEnv.addGlobal("govukRebrand", useRebrand());

  return nunjucksEnv;
}
