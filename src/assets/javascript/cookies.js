"use strict";

var cookies = function (trackingId) {
  var COOKIES_PREFERENCES_SET = "cookies_preferences_set";

  var cookiesAccepted = document.querySelector("#cookies-accepted");
  var cookiesRejected = document.querySelector("#cookies-rejected");
  var hideCookieBanner = document.querySelectorAll(".cookie-hide-button");
  var cookieBannerContainer = document.querySelector(".govuk-cookie-banner");
  var cookieBanner = document.querySelector("#cookies-banner-main");
  var acceptCookies = document.querySelector('button[name="cookiesAccept"]');
  var rejectCookies = document.querySelector('button[name="cookiesReject"]');

  function cookieBannerInit() {
    acceptCookies.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        setBannerCookieConsent(true);
      }.bind(this)
    );

    rejectCookies.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        setBannerCookieConsent(false);
      }.bind(this)
    );

    var hideButtons = Array.prototype.slice.call(hideCookieBanner);
    hideButtons.forEach(function (element) {
      element.addEventListener(
        "click",
        function (event) {
          event.preventDefault();
          hideElement(cookieBannerContainer);
        }.bind(this)
      );
    });

    var hasCookiesPolicy = getCookie(COOKIES_PREFERENCES_SET);

    if (!hasCookiesPolicy) {
      showElement(cookieBannerContainer);
    }
  }

  function setBannerCookieConsent(analyticsConsent) {
    setCookie(
      COOKIES_PREFERENCES_SET,
      { analytics: analyticsConsent },
      { days: 365 }
    );

    hideElement(cookieBanner);

    if (analyticsConsent) {
      showElement(cookiesAccepted);
      initAnalytics();
    } else {
      showElement(cookiesRejected);
    }
  }

  function saveCookieSettings(event) {
    event.preventDefault();

    var hasConsented =
      document.querySelector(
        '#radio-cookie-preferences input[type="radio"]:checked'
      ).value === "true";

    setCookie(COOKIES_PREFERENCES_SET, {
      analytics: hasConsented,
    });
    showElement(document.querySelector("#save-success-banner"));

    if (hasConsented) {
      initAnalytics();
    }

    var isGaCookie = !!(getCookie("_ga") && getCookie("_gid"));

    if (isGaCookie && !hasConsented) {
      var gtagCookie = "_gat_gtag_" + trackingId.replace(/-/g, "_");

      setCookie("_ga", "", { days: -1 });
      setCookie("_gid", "", { days: -1 });
      setCookie(gtagCookie, "", { days: -1 });
    }

    window.scrollTo(0, 0);
  }

  function cookiesPageInit() {
    var analyticsConsent = hasConsentForAnalytics();

    if (analyticsConsent) {
      setCookie(COOKIES_PREFERENCES_SET, { analytics: analyticsConsent });
      document.querySelector("#policy-cookies-accepted").checked =
        analyticsConsent;
    } else {
      document.querySelector("#policy-cookies-rejected").checked = true;
    }

    document.querySelector("#save-cookie-settings").addEventListener(
      "click",
      function (event) {
        saveCookieSettings(event);
      }.bind(this)
    );
  }

  function hasConsentForAnalytics() {
    var cookieConsent = JSON.parse(getCookie(COOKIES_PREFERENCES_SET));
    return cookieConsent ? cookieConsent.analytics : false;
  }

  function initAnalytics() {
    loadGtmScript();
    initGtm();
  }

  function loadGtmScript() {
    var gtmScriptTag = document.createElement("script");
    gtmScriptTag.type = "text/javascript";
    gtmScriptTag.setAttribute("async", "true");
    gtmScriptTag.setAttribute(
      "src",
      "https://www.googletagmanager.com/gtm.js?id=" + trackingId
    );
    document.documentElement.firstChild.appendChild(gtmScriptTag);
  }

  function initGtm() {
    window.dataLayer = [
      {
        "gtm.allowlist": ["google"],
        "gtm.blocklist": [
          "nonGoogleScripts",
          "nonGoogleIframes",
          "nonGooglePixels",
          "customScripts",
          "customPixels",
        ],
      },
    ];

    function gtag(obj) {
      dataLayer.push(obj);
    }

    gtag({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  }

  function getCookie(name) {
    var nameEQ = name + "=";
    var cookies = document.cookie.split(";");
    for (var i = 0, len = cookies.length; i < len; i++) {
      var cookie = cookies[i];
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  }

  function setCookie(name, values, options) {
    if (typeof options === "undefined") {
      options = {};
    }

    var cookieString = name + "=" + JSON.stringify(values);
    if (options.days) {
      var date = new Date();
      date.setTime(date.getTime() + options.days * 24 * 60 * 60 * 1000);
      cookieString =
        cookieString + "; expires=" + date.toGMTString() + "; path=/";
    }

    if (document.location.protocol === "https:") {
      cookieString = cookieString + "; Secure";
    }

    document.cookie = cookieString;
  }

  function hideElement(el) {
    el.style.display = "none";
  }

  function showElement(el) {
    el.style.display = "block";
  }

  function isOnCookiesPage() {
    return window.location.pathname.indexOf("cookies") !== -1;
  }

  return {
    cookieBannerInit,
    isOnCookiesPage,
    cookiesPageInit,
    hasConsentForAnalytics,
    initAnalytics,
  };
};

window.GOVSignIn = window.GOVSignIn || {};
window.GOVSignIn.Cookies = cookies;
