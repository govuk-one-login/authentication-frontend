import analyticsModule from "./analytics.mjs";
import cookiesModule from "./cookies.mjs";
import phonenumberModule from "./phonenumber.mjs";
import radiobuttonModule from "./radiobutton.mjs";
import showPasswordModule from "./showPassword.mjs";

let uaTrackingId, analyticsCookieDomain;
const init = (params) => {
  "use strict";
  uaTrackingId = params.uaTrackingId;
  analyticsCookieDomain = params.analyticsCookieDomain;

  window.GOVUKFrontend.initAll();

  phonenumberModule.init();
  radiobuttonModule.init();
  const passwordModules = [];
  const pwModules = document.querySelectorAll('[data-module="show-password"]');
  for (let i = 0, l = pwModules.length; i < l; i++) {
      passwordModules.push(showPasswordModule.init(pwModules[i]));
  }
  cookiesModule.init(analyticsCookieDomain);
  if (cookiesModule.hasConsentForAnalytics()) {
    initialiseAnalytics();
  } else {
    // if the user has not already consented to analytics, listen for the cookie-consent event
    window.addEventListener('cookie-consent', () => {
      initialiseAnalytics();
    });
  }
}

const initialiseAnalytics = () => {
  analyticsModule.init(uaTrackingId);
}

export default { init };