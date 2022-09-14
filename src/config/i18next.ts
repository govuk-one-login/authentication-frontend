import { LOCALE } from "../app.constants";
import { getServiceDomain, supportLanguageCY } from "../config";

export function i18nextConfigurationOptions(
  path: string
): Record<string, unknown> {
  return {
    debug: false,
    fallbackLng: LOCALE.EN,
    preload: [LOCALE.EN],
    supportedLngs: supportLanguageCY() ? [LOCALE.EN, LOCALE.CY] : [LOCALE.EN],
    backend: {
      loadPath: path,
      allowMultiLoading: true,
    },
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
