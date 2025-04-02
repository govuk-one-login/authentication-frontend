import * as addLanguageParam from "@govuk-one-login/frontend-language-toggle";
import * as nunjucks from "nunjucks";
import i18next from "i18next";
import { returnLastCharactersOnly } from "../utils/phone-number";
import { getNodeEnv } from "../config";
import { ENVIRONMENT_NAME } from "../app.constants";
export function configureNunjucks(app, viewsPath) {
    const nunjucksEnv = nunjucks.configure(viewsPath, {
        autoescape: true,
        express: app,
        noCache: getNodeEnv() !== ENVIRONMENT_NAME.PROD,
    });
    nunjucksEnv.addFilter("translate", function (key, options) {
        const translate = i18next.getFixedT(this.ctx.i18n.language);
        return translate(key, options);
    });
    nunjucksEnv.addFilter("returnLastCharacters", function (key, options) {
        return returnLastCharactersOnly(key, options);
    });
    nunjucksEnv.addGlobal("addLanguageParam", addLanguageParam);
    return nunjucksEnv;
}
