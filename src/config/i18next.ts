import { LOCALE } from "../app.constants.js";
import { getServiceDomain } from "../config.js";
export function i18nextConfigurationOptions(path: string): Record<string, unknown> {
  return {
    debug: false,
    fallbackLng: LOCALE.EN,
    preload: [LOCALE.EN],
    supportedLngs: [LOCALE.EN, LOCALE.CY],
    backend: { loadPath: path, allowMultiLoading: true },
    detection: {
      lookupCookie: "lng",
      lookupQuerystring: "lng",
      order: ["querystring", "cookie"],
      caches: ["cookie"],
      ignoreCase: true,
      cookieSecure: true,
      cookieDomain: getServiceDomain(),
      cookieSameSite: "",
    },
  };
}
