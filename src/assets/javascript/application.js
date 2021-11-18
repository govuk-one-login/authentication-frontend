function initFeedbackRadioButtons() {
  var feedbackRadioButtons = Array.prototype.slice.call(
    document.querySelectorAll('input[name="feedbackContact"]')
  );
  var container = document.querySelector("#contact-details-container");
  feedbackRadioButtons.forEach(function (element) {
    element.addEventListener(
      "click",
      function (event) {
        if (event.target.value === "true") {
          container.classList.remove("govuk-!-display-none");
        } else {
          container.classList.add("govuk-!-display-none");
        }
      }.bind(this)
    );
  });
}

(function (w) {
  "use strict";
  function appInit(trackingId, analyticsCookieDomain) {
    var cookies = window.GOVSignIn.Cookies(trackingId, analyticsCookieDomain);

    if (cookies.hasConsentForAnalytics()) {
      cookies.initAnalytics();
    }

    cookies.cookieBannerInit();
  }

  initFeedbackRadioButtons();

  w.GOVSignIn.appInit = appInit;
})(window);
