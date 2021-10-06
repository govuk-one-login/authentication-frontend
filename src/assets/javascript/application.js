(function (w) {
  "use strict";
  function appInit(trackingId, cookieDomain) {
    var cookies = window.GOVSignIn.Cookies(trackingId, cookieDomain);

    cookies.processCookieConsentFlag();

    if (cookies.hasConsentForAnalytics()) {
      cookies.initAnalytics();
    }

    if (cookies.isOnCookiesPage()) {
      cookies.cookiesPageInit();
    } else {
      cookies.cookieBannerInit();
    }
  }
  w.GOVSignIn.appInit = appInit;
})(window);
