export interface CookieConsentServiceInterface {
  getCookieConsent: (cookieConsentValue: string) => any;
  createConsentCookieValue: (cookieConsentValue: string) => CookieConsentModel;
}

export interface CookieConsentModel {
  value: string;
  expires: Date;
}
