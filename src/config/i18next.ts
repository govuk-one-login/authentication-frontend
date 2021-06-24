import { LOCALE } from "../app.constants";
import path from "path";

export const i18nextConfigurationOptions = {
  debug: false,
  fallbackLng: LOCALE.EN,
  lng: LOCALE.EN,
  preload: [LOCALE.EN],
  supportedLngs: [LOCALE.EN, LOCALE.CY],
  backend: {
    loadPath: path.join(__dirname, "../../locales/{{lng}}/{{ns}}.json"),
    allowMultiLoading: true,
  },
  detection: {
    lookupCookie: "lng",
    lookupQuerystring: "lng",
    order: ["querystring", "cookie"],
    caches: ["cookie"],
    ignoreCase: true,
    cookieSecure: true,
  },
};
