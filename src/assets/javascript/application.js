function initFeedbackRadioButtons() {
  var e = Array.prototype.slice.call(
      document.querySelectorAll('input[name="feedbackContact"]')
    ),
    o = document.querySelector("#contact-details-container");
    e.forEach(function (e) {
      e.addEventListener(
        "click",
        function (e) {
          if ("true" === e.target.value)
            o.classList.remove("govuk-!-display-none");
          else {
            o.classList.add("govuk-!-display-none");
            for (
              var t = o.getElementsByTagName("input"), n = 0;
              n < t.length;
              n++
            )
              "text" == t[n].type && (t[n].value = "");
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
