function gtag(e) {
  ((window.dataLayer = window.dataLayer || []), window.dataLayer.push(e));
}
function generateSessionJourney(e, n) {
  return { sessionjourney: { journey: e, status: n } };
}
function getJourneyMapping(e) {
  return {
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
  }[e];
}
function pushLanguageToDataLayer() {
  var e =
      document.querySelector("html") &&
      document.querySelector("html").getAttribute("lang"),
    n = { en: "english", cy: "welsh" };
  e && n[e] && gtag({ event: "langEvent", language: n[e], languagecode: e });
}
function pushCustomEventsToDataLayer(e) {
  e &&
    (gtag({ department: { programmeteam: "di", productteam: "sso" } }),
    (e = getJourneyMapping(window.location.pathname)) && gtag(e),
    pushLanguageToDataLayer(),
    gtag({ event: "gtm.js", "gtm.start": new Date().getTime() }));
}
((window.GOVSignIn = window.GOVSignIn || {}),
  (window.GOVSignIn.pushCustomEventsToDataLayer = pushCustomEventsToDataLayer));
