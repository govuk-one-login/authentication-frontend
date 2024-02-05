import express from "express";
import * as nunjucks from "nunjucks";
import i18next from "i18next";
import { Environment } from "nunjucks";
import { getNodeEnv } from "../config";
import { ENVIRONMENT_NAME } from "../app.constants";

export function configureNunjucks(
  app: express.Application,
  viewsPath: string[]
): Environment {
  const nunjucksEnv: nunjucks.Environment = nunjucks.configure(viewsPath, {
    autoescape: true,
    express: app,
    noCache: getNodeEnv() !== ENVIRONMENT_NAME.PROD,
  });

  nunjucksEnv.addFilter("translate", function (key: string, options?: any) {
    const translate = i18next.getFixedT(this.ctx.i18n.language);
    return translate(key, options);
  });

  return nunjucksEnv;
}
