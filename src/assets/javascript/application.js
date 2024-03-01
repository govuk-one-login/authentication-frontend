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
            var n = o.getElementsByTagName("input"), t = 0;
            t < n.length;
            t++
          )
            "text" == n[t].type && (n[t].value = "");
        }
      }.bind(this)
    );
  });
}
var onIntNumberSelected = function (e, n) {
  e.checked
    ? ((n.value = ""),
      (n.disabled = !0),
      n.classList.add("govuk-input--disabled"))
    : ((n.disabled = !1), n.classList.remove("govuk-input--disabled"));
};
function initEnterPhoneNumber() {
  var n = document.querySelector("#phoneNumber"),
    e = document.querySelector("#hasInternationalPhoneNumber");
  n &&
    e &&
    (e.addEventListener("click", function (e) {
      onIntNumberSelected(e.currentTarget, n);
    }),
    window.addEventListener("load", onIntNumberSelected(e, n)));
}
!(function (e) {
  "use strict";
  if (
    (initFeedbackRadioButtons(),
    initEnterPhoneNumber(),
    e.GOVUK && e.GOVUK.Modules && e.GOVUK.Modules.ShowPassword)
  )
    for (
      var n = document.querySelectorAll('[data-module="show-password"]'),
        t = 0,
        o = n.length;
      t < o;
      t++
    )
      GOVUK.Modules.ShowPassword.prototype.init &&
        new GOVUK.Modules.ShowPassword(n[t]).init()
})(window);
