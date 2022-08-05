"use strict";

var cookies = function (trackingId, analyticsCookieDomain) {
  var COOKIES_PREFERENCES_SET = "cookies_preferences_set";
  var COOKIES_HISTORY_LENGTH = "chl";
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

  function cookiesPageInit() {
    document.querySelector("#cookie-preferences-form").hidden = false;
    var chl = getCookie(COOKIES_HISTORY_LENGTH);
    if (! chl || chl === "0" ) {
      setCookie(
        COOKIES_HISTORY_LENGTH,
        window.history.length
        );
    }
    document.querySelector("#go-back-link").onclick = function() {
      var chl = getCookie(COOKIES_HISTORY_LENGTH);
      if (chl && !isNaN(chl)) {
        var backCount = (window.history.length - chl) + 1;
        window.history.go(-(Math.abs(backCount)));
        setCookie(COOKIES_HISTORY_LENGTH, 0);
      }
    };
  }

  function hasConsentForAnalytics() {
    var cookieConsent = JSON.parse(getCookie(COOKIES_PREFERENCES_SET));
    return cookieConsent ? cookieConsent.analytics : false;
  }

  function initAnalytics() {
    loadGtmScript();
    initGtm();
    initLinkerHandlers();
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

    var sessionJourney = getJourneyMapping(window.location.pathname);

    function gtag(obj) {
      dataLayer.push(obj);
    }

    if (sessionJourney) {
      gtag(sessionJourney);
    }

    gtag({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  }

  function initLinkerHandlers() {
    var submitButton = document.querySelector('button[type="submit"]');
    var pageForm = document.getElementById("form-tracking");

    if (submitButton && pageForm) {
      submitButton.addEventListener("click", function () {
        if (window.ga && window.gaplugins) {
          var tracker = ga.getAll()[0];
          var linker = new window.gaplugins.Linker(tracker);
          var destinationLink = linker.decorate(pageForm.action);
          pageForm.action = destinationLink;
        }
      });
    }

    var trackLink = document.getElementById("track-link");

    if (trackLink) {
      trackLink.addEventListener("click", function (e) {
        e.preventDefault();

        if (window.ga && window.gaplugins) {
          var tracker = ga.getAll()[0];
          var linker = new window.gaplugins.Linker(tracker);
          var destinationLink = linker.decorate(trackLink.href);
          window.location.href = destinationLink;
        } else {
          window.location.href = trackLink.href;
        }
      });
    }
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
      "/enter-email-create": generateSessionJourney("sign up", "start"),
      "/account-not-found": generateSessionJourney("sign up", "start"),
      "/check-your-email": generateSessionJourney("sign up", "middle"),
      "/create-password": generateSessionJourney("sign up", "middle"),
      "/enter-phone-number": generateSessionJourney("sign up", "middle"),
      "/check-your-phone": generateSessionJourney("sign up", "middle"),
      "/setup-authenticator-app": generateSessionJourney('sign up', 'middle'),
      "/get-security-codes": generateSessionJourney('sign up', 'middle'),
      "/account-created": generateSessionJourney("sign up", "end"),
      "/enter-email": generateSessionJourney("sign in", "start"),
      "/enter-password-account-exists": generateSessionJourney(
        "sign in",
        "start"
      ),
      "/enter-password": generateSessionJourney("sign in", "middle"),
      "/enter-authenticator-app-code": generateSessionJourney('sign in', 'middle'),
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
    cookiesPageInit,
    hasConsentForAnalytics,
    initAnalytics,
  };
};

window.GOVSignIn = window.GOVSignIn || {};
window.GOVSignIn.Cookies = cookies;
