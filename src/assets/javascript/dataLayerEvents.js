"use strict";

function gtag(obj) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(obj);
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
    "/setup-authenticator-app": generateSessionJourney("sign up", "middle"),
    "/get-security-codes": generateSessionJourney("sign up", "middle"),
    "/account-created": generateSessionJourney("sign up", "end"),
    "/enter-email": generateSessionJourney("sign in", "start"),
    "/enter-password-account-exists": generateSessionJourney(
      "sign in",
      "start"
    ),
    "/enter-password": generateSessionJourney("sign in", "middle"),
    "/enter-authenticator-app-code": generateSessionJourney(
      "sign in",
      "middle"
    ),
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
    "/change-codes-confirmed": generateSessionJourney(
      "change security codes",
      "end"
    ),
  };

  return JOURNEY_DATA_LAYER_PATHS[url];
}

function pushLanguageToDataLayer() {
  var languageCode =
    document.querySelector("html") &&
    document.querySelector("html").getAttribute("lang");

  var languageNames = {
    en: "english",
    cy: "welsh",
  };

  if (languageCode && languageNames[languageCode]) {
    gtag({
      event: "langEvent",
      language: languageNames[languageCode],
      languagecode: languageCode,
    });
  }
}

function pushCustomEventsToDataLayer(hasConsentedForAnalytics) {
  if (!hasConsentedForAnalytics) return;

  gtag({
    department: {
      programmeteam: "di",
      productteam: "sso",
    },
  });

  var sessionJourney = getJourneyMapping(window.location.pathname);
  if (sessionJourney) {
    gtag(sessionJourney);
  }

  pushLanguageToDataLayer();
  gtag({ event: "gtm.js", "gtm.start": new Date().getTime() });
}

window.GOVSignIn = window.GOVSignIn || {};
window.GOVSignIn.pushCustomEventsToDataLayer = pushCustomEventsToDataLayer;
