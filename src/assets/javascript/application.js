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
(function (w) {
  "use strict";
  function appInit() {
    window.GOVUKFrontend.initAll();
    var cookies = window.GOVSignIn.Cookies();

    if (window.DI.analyticsGa4.cookie.hasConsentForAnalytics()) {
      cookies.initAnalytics();
    }

    if(window.dtrum !== undefined) {
      if(window.DI.analyticsGa4.cookie.hasConsentForAnalytics()) {
        window.dtrum.enable()
      } else {
        window.dtrum.disable()
      }
    }
  }

  initFeedbackRadioButtons();
  initEnterPhoneNumber();

  if (w.GOVUK && w.GOVUK.Modules && w.GOVUK.Modules.ShowPassword) {
    var modules = document.querySelectorAll('[data-module="show-password"]');

    for (var i = 0, l = modules.length; i < l; i++) {
      if (GOVUK.Modules.ShowPassword.prototype.init) {
        new GOVUK.Modules.ShowPassword(modules[i]).init();
      }
    }
  }

  w.DI.analyticsUa.init = appInit;
})(window); 
