import {LOCALE} from "../app.constants";
import path from "path";

const { NODE_ENV } = process.env

export const i18nextConfigurationOptions = {
  debug: false,
  fallbackLng: LOCALE.EN,
  preload: [LOCALE.EN],
  supportedLngs: [LOCALE.EN, LOCALE.CY],
  backend: {
    loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
  },
  detection: {
    lookupCookie: "lng",
    lookupQuerystring: "lng",
    order: ["querystring", "cookie"],
    caches: ["cookie"],
    ignoreCase: true,
    cookieSecure: false,
  },
  autoReload: NODE_ENV !== 'production'
};
