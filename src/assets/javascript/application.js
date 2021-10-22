(function (w) {
  "use strict";
  function appInit(trackingId, analyticsCookieDomain) {
    var cookies = window.GOVSignIn.Cookies(trackingId, analyticsCookieDomain);

    if (cookies.hasConsentForAnalytics()) {
      cookies.initAnalytics();
    }

    cookies.cookieBannerInit();
  }
  w.GOVSignIn.appInit = appInit;
})(window);
