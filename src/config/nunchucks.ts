import type express from "express";
import nunjucks from "nunjucks";
import i18next from "i18next";
import { returnLastCharactersOnly } from "../utils/phone-number.js";
import { getNodeEnv, useRebrand } from "../config.js";
import { ENVIRONMENT_NAME } from "../app.constants.js";
import addLanguageParam from "@govuk-one-login/frontend-language-toggle";

export function configureNunjucks(
  app: express.Application,
  viewsPath: string[]
): nunjucks.Environment {
  const nunjucksEnv: nunjucks.Environment = nunjucks.configure(viewsPath, {
    autoescape: true,
    express: app,
    noCache: getNodeEnv() !== ENVIRONMENT_NAME.PROD,
  });

  nunjucksEnv.addFilter("translate", function (key: string, options?: any) {
    const translate = i18next.getFixedT(this.ctx.i18n.language);
    return translate(key, options);
  });

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
