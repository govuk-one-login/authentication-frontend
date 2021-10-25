"use strict";

var cookies = function (trackingId, analyticsCookieDomain) {
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
        "gtm.blocklist": ["adm", "awct", "sp", "gclidw", "gcs", "opt"],
      },
      {
        department: {
          programmeteam: "di",
          productteam: "sso",
        },
      },
    ];

    function addSessionJourneyToDataLayer(url) {
      const sessionJourney = getJourneyMapping(url);

      if (sessionJourney) {
        window.dataLayer.push(sessionJourney);
      }
    }

    const url = window.location.search.includes("type")
      ? window.location.pathname + window.location.search
      : window.location.pathname;

    addSessionJourneyToDataLayer(url);

    function gtag(obj) {
      dataLayer.push(obj);
    }

    gtag({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  }

  function generateSessionJourney(journey, status) {
    return {
      sessionjourney: {
        journey: journey,
        status: status,
      },
    };
  }

  function getJourneyMapping(url) {
    const JOURNEY_DATA_LAYER_PATHS = {
      "/enter-email?type=create-account": generateSessionJourney(
        "sign up",
        "start"
      ),
      "/account-not-found": generateSessionJourney("sign up", "start"),
      "/check-your-email": generateSessionJourney("sign up", "middle"),
      "/create-password": generateSessionJourney("sign up", "middle"),
      "/enter-phone-number": generateSessionJourney("sign up", "middle"),
      "/check-your-phone": generateSessionJourney("sign up", "middle"),
      "/account-created": generateSessionJourney("sign up", "end"),
      "/enter-email?type=sign-in": generateSessionJourney("sign in", "start"),
      "/enter-password-account-exists": generateSessionJourney(
        "sign in",
        "start"
      ),
      "/enter-password": generateSessionJourney("sign in", "middle"),
      "/enter-code": generateSessionJourney("sign in", "middle"),
      "/resend-code": generateSessionJourney("sign in", "middle"),
      "/updated-terms-and-conditions": generateSessionJourney(
        "sign in",
        "middle"
      ),
      "/share-info": generateSessionJourney("sign in", "middle"),
      "/reset-password-check-email": generateSessionJourney(
        "password reset",
        "start"
      ),
      "/reset-password": generateSessionJourney("password reset", "middle"),
      "/reset-password-confirmed": generateSessionJourney(
        "password reset",
        "end"
      ),
    };

    return JOURNEY_DATA_LAYER_PATHS[url];
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
        cookieString +
        "; expires=" +
        date.toGMTString() +
        "; path=/;" +
        " domain=" +
        analyticsCookieDomain +
        ";";
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
    hasConsentForAnalytics,
    initAnalytics,
  };
};

window.GOVSignIn = window.GOVSignIn || {};
window.GOVSignIn.Cookies = cookies;
