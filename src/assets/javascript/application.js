console.log("in the file")

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
var onIntNumberSelected = function (e, t) {
  e.checked
    ? ((t.value = ""),
      (t.disabled = !0),
      t.classList.add("govuk-input--disabled"))
    : ((t.disabled = !1), t.classList.remove("govuk-input--disabled"));
};
function initEnterPhoneNumber() {
  var t = document.querySelector("#phoneNumber"),
    e = document.querySelector("#hasInternationalPhoneNumber");
  t &&
    e &&
    (e.addEventListener("click", function (e) {
      onIntNumberSelected(e.currentTarget, t);
    }),
    window.addEventListener("load", onIntNumberSelected(e, t)));
}

window.DI = window.DI || {};
window.DI.analyticsUa = window.DI.analyticsUa || {};

(function (e) {
  "use strict";

  console.log("in the function")

  function appInit() {

    console.log("in the app init")
    console.log(window.DI.analyticsGa4.cookie.hasConsentForAnalytics())

    window.GOVUKFrontend.initAll();
    console.log("app init all done")

    var cookies = window.GOVSignIn.Cookies(); // code errors here


    if (window.DI.analyticsGa4.cookie.hasConsentForAnalytics()) {
      console.log("has consent for cookies!")
      cookies.initAnalytics();
      console.log("has init analytics!")
      cookies.test()
    }
  }

  if (
    (initFeedbackRadioButtons(),
    initEnterPhoneNumber(),
    e.GOVUK && e.GOVUK.Modules && e.GOVUK.Modules.ShowPassword)
  )
    for (
      var t = document.querySelectorAll('[data-module="show-password"]'),
        n = 0,
        o = t.length;
      n < o;
      n++
    )
      GOVUK.Modules.ShowPassword.prototype.init &&
        new GOVUK.Modules.ShowPassword(t[n]).init();

    e.DI.analyticsUa.init = appInit;
})(window);
