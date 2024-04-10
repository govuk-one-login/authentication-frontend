function initFeedbackRadioButtons() {
  var feedbackRadioButtons = Array.prototype.slice.call(
      document.querySelectorAll('input[name="feedbackContact"]')
    );
    var container = document.querySelector("#contact-details-container");
    feedbackRadioButtons.forEach(function (element) {
      element.addEventListener(
        "click",
        function (event) {
          if (e.target.value === "true")
            container.classList.remove("govuk-!-display-none");
          else {
            container.classList.add("govuk-!-display-none");
            var elements = container.getElementsByTagName("input");
            for (var i = 0; i < elements.length; i++) {
              if (elements[i].type == "text") {
                elements[i].value = "";
              }
            }
          }
      }.bind(this)
    );
  });
}
var onIntNumberSelected = function (intPhoneNumberCheckbox, phoneNumberInput) {
  if (intPhoneNumberCheckbox.checked) {
    phoneNumberInput.value = "";
    phoneNumberInput.disabled = true;
    phoneNumberInput.classList.add("govuk-input--disabled");
  } else {
    phoneNumberInput.disabled = false;
    phoneNumberInput.classList.remove("govuk-input--disabled");
  }
};

function initEnterPhoneNumber() {
  var phoneNumberInput = document.querySelector("#phoneNumber");
  var intPhoneNumberCheckbox = document.querySelector(
    "#hasInternationalPhoneNumber"
  );
  if (phoneNumberInput && intPhoneNumberCheckbox) {
    intPhoneNumberCheckbox.addEventListener("click", function (event) {
      onIntNumberSelected(event.currentTarget, phoneNumberInput);
    });
    window.addEventListener(
      "load",
      onIntNumberSelected(intPhoneNumberCheckbox, phoneNumberInput)
    );
  }
}

window.DI = window.DI || {};
window.DI.analyticsUa = window.DI.analyticsUa || {};

(function (e) {
  "use strict";

  function appInit() {

    window.GOVUKFrontend.initAll();

    var cookies = window.GOVSignIn.Cookies();

    if (window.DI.analyticsGa4.cookie.hasConsentForAnalytics()) {
      cookies.initAnalytics();
    }
  }

  if (
    (initFeedbackRadioButtons(),
    initEnterPhoneNumber(),
    e.GOVSignIn && e.GOVSignIn.Modules && e.GOVSignIn.Modules.ShowPassword)
  )
    for (
      var t = document.querySelectorAll('[data-module="show-password"]'),
        n = 0,
        o = t.length;
      n < o;
      n++
    )
      GOVSignIn.Modules.ShowPassword.prototype.init &&
        new GOVSignIn.Modules.ShowPassword(t[n]).init();

    e.DI.analyticsUa.init = appInit;
})(window);
