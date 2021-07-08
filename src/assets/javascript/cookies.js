window.govSigin = window.govSigin ?? {};

(function(w) {
  "use strict";

  var COOKIES_PREFERENCES_SET = "cookies_preferences_set";

  var cookiesAccepted = document.querySelector("#cookies-accepted");
  var cookiesRejected = document.querySelector("#cookies-rejected");
  var hideCookieBanner = document.querySelectorAll(".cookie-hide-button");
  var cookieBannerContainer = document.querySelector(".govuk-cookie-banner");
  var cookieBanner = document.querySelector("#cookies-banner-main");
  var acceptCookies = document.querySelector("button[name=\"cookiesAccept\"]");
  var rejectCookies = document.querySelector("button[name=\"cookiesReject\"]");
  var cookiePreferencesExist =
    document.cookie.indexOf(COOKIES_PREFERENCES_SET + '=') > -1;

  function init() {
    if (cookiePreferencesExist || isOnCookiesPage()) {
      return;
    }

    showElement(cookieBannerContainer);

    acceptCookies.addEventListener(
      "click",
      function(event) {
        event.preventDefault();
        setCookie(COOKIES_PREFERENCES_SET, { "analytics": "true" });
        showElement(cookiesAccepted);
        hideElement(cookieBanner);
      }.bind(this),
    );

    rejectCookies.addEventListener(
      "click",
      function(event) {
        event.preventDefault();
        setCookie(COOKIES_PREFERENCES_SET,{ "analytics": "false" });
        showElement(cookiesRejected);
        hideElement(cookieBanner);
      }.bind(this),
    );

    hideCookieBanner.forEach((element) => {
      element.addEventListener(
        "click",
        function(event) {
          event.preventDefault();
          hideElement(cookieBannerContainer);
        }.bind(this),
      );
    });
  }

  function setCookie(n, v) {
    var currentDate = new Date();
    var expiryDate = new Date(
      currentDate.setMonth(currentDate.getMonth() + 12),
    );
    document.cookie =
      n + "=" +
      JSON.stringify(v) +
      "; expires=" +
      expiryDate +
      "; path=/; Secure";
  }

  function hideElement(el) {
    el.style.display = "none";
  }

  function showElement(el) {
    el.style.display = "block";
  }

  function isOnCookiesPage() {
    return window.location.pathname === "/cookies";
  }

  w.govSigin.CookieBanner = init;
})(window);
