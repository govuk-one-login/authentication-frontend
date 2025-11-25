import type express from "express";
import nunjucks from "nunjucks";
import i18next from "i18next";
import { returnLastCharactersOnly } from "../utils/phone-number.js";
import { getNodeEnv, useRebrand } from "../config.js";
import { ENVIRONMENT_NAME } from "../app.constants.js";
import addLanguageParam from "@govuk-one-login/frontend-language-toggle";

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
      const language = this.ctx.i18n?.language || this.ctx.htmlLang || 'en';
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
