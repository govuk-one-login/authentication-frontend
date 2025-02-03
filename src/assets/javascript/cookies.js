"use strict";

var cookies = function () {

  function initAnalytics() {
    window.DI.analyticsGa4.loadGtmScript(window.DI.analyticsGa4.uaContainerId);
    initGtm();
  }

  function pushLanguageToDataLayer() {
    var languageCode = document.querySelector('html') &&
        document.querySelector('html').getAttribute('lang');

    var languageNames = {
      'en':'english',
      'cy':'welsh'
    }

    if (languageCode && languageNames[languageCode]) {

      window.dataLayer = window.dataLayer || [];

      window.dataLayer.push({
        event: "langEvent",
        language: languageNames[languageCode],
        languagecode: languageCode
      });
    }
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

    pushLanguageToDataLayer();
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
      "/reset-password-check-email": generateSessionJourney(
        "password reset",
        "start"
      ),
      "/reset-password": generateSessionJourney("password reset", "middle"),
      "/reset-password-confirmed": generateSessionJourney(
        "password reset",
        "end"
      ),
      "/check-email-change-security-codes": generateSessionJourney("change security codes", "start"),
      "/change-codes-confirmed": generateSessionJourney("change security codes", "end"),
    };

    return JOURNEY_DATA_LAYER_PATHS[url];
  }

  return {
    initAnalytics,
  };
};

window.GOVSignIn = window.GOVSignIn || {};
window.GOVSignIn.Cookies = cookies;
