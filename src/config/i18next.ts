import {LOCALE} from "../app.constants";

export const i18nextConfigurationOptions = {
  debug: false,
  fallbackLng: LOCALE.EN,
  preload: [LOCALE.EN],
  supportedLngs: [LOCALE.EN, LOCALE.CY],
  backend: {
    loadPath: `locales/{{lng}}/{{ns}}.json`,
  },
  detection: {
    lookupCookie: "lng",
    lookupQuerystring: "lng",
    order: ["querystring", "cookie"],
    caches: ["cookie"],
    ignoreCase: true,
    cookieSecure: false,
  },
};
