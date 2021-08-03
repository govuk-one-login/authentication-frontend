window.govSigin = window.govSigin ?? {};

(function (w) {
  "use strict";

  var COOKIES_PREFERENCES_SET = "cookies_preferences_set";

  var cookiesAccepted = document.querySelector("#cookies-accepted");
  var cookiesRejected = document.querySelector("#cookies-rejected");
  var hideCookieBanner = document.querySelectorAll(".cookie-hide-button");
  var cookieBannerContainer = document.querySelector(".govuk-cookie-banner");
  var cookieBanner = document.querySelector("#cookies-banner-main");
  var acceptCookies = document.querySelector('button[name="cookiesAccept"]');
  var rejectCookies = document.querySelector('button[name="cookiesReject"]');
  var cookiePreferencesExist =
    document.cookie.indexOf(COOKIES_PREFERENCES_SET + "=") > -1;

  function init() {
    if (isOnCookiesPage()) {
      cookiesPageInit();
      return;
    } else if (cookiePreferencesExist) {
      return;
    }

    showElement(cookieBannerContainer);

    acceptCookies.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        setCookie(COOKIES_PREFERENCES_SET, { analytics: true });
        showElement(cookiesAccepted);
        hideElement(cookieBanner);
      }.bind(this)
    );

    rejectCookies.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        setCookie(COOKIES_PREFERENCES_SET, { analytics: false });
        showElement(cookiesRejected);
        hideElement(cookieBanner);
      }.bind(this)
    );

    const hideButtons = Array.prototype.slice.call(hideCookieBanner);
    hideButtons.forEach(function (element) {
      element.addEventListener(
        "click",
        function (event) {
          event.preventDefault();
          hideElement(cookieBannerContainer);
        }.bind(this)
      );
    });
  }

  function setCookie(name, value) {
    var currentDate = new Date();
    var expiryDate = new Date(
      currentDate.setMonth(currentDate.getMonth() + 12)
    );
    document.cookie =
      name +
      "=" +
      JSON.stringify(value) +
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

  function cookiesPageInit() {
    var cookie = getCookieValue(COOKIES_PREFERENCES_SET);
    var analyticsValue = false;

    if (!cookie) {
      setCookie(COOKIES_PREFERENCES_SET, { analytics: false });
    } else {
      analyticsValue = JSON.parse(cookie).analytics;
    }

    document.querySelector("#policy-cookies-accepted").checked = analyticsValue;
    document.querySelector("#policy-cookies-rejected").checked =
      !analyticsValue;
    document.querySelector("#save-cookie-settings").addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        var selectedPreference = document.querySelector(
          '#radio-cookie-preferences input[type="radio"]:checked'
        ).value;
        setCookie(COOKIES_PREFERENCES_SET, {
          analytics: selectedPreference === "true",
        });
        showElement(document.querySelector("#save-success-banner"));
        window.scrollTo(0, 0);
      }.bind(this)
    );
    document.querySelector("#go-back-link").addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        window.history.back();
      }.bind(this)
    );
  }

  function getCookieValue(cookieName) {
    const cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      const name = cookies[i].split("=")[0].toLowerCase().trim();
      if (name.indexOf(cookieName) !== -1) {
        return cookies[i].split("=")[1];
      }
    }
    return undefined;
  }

  w.govSigin.CookieBanner = init;
})(window);
