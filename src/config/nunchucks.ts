import express from "express";
import * as nunjucks from "nunjucks";
import path from "path";
import i18next from "i18next";
import { Environment } from "nunjucks";

export const configureNunjucks = (app: express.Application): Environment => {
  const nunjucksEnv: nunjucks.Environment = nunjucks.configure(
    ["src/views", path.resolve("node_modules/govuk-frontend/")],
    {
      autoescape: true,
      express: app,
      noCache: true,
    }
  );

  nunjucksEnv.addFilter("translate", function (key: string, options?: any) {
    const translate = i18next.getFixedT(this.ctx.i18n.language);
    return translate(key, options);
  });

  return nunjucksEnv;
};
