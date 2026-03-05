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
function getCookieValue(t) {
  let e = document.cookie.split(";"),
    n;
  return (
    e.forEach((e) => {
      -1 !== e.split("=")[0].toLowerCase().trim().indexOf(t) &&
        (n = e.split("=")[1]);
    }),
    n
  );
}
function tryOrReturnDefault(e, t) {
  try {
    return e();
  } catch (e) {
    return t;
  }
}
function getAnalyticsConsentStatus() {
  let e = getCookieValue("cookies_preferences_set");
  var t;
  return (
    !!e &&
    !!(t = tryOrReturnDefault(() => JSON.parse(decodeURIComponent(e)), !1)) &&
    !0 === t.analytics
  );
}
function initDynaTraceRUM(e) {
  e
    ? window.dtrum && window.dtrum.enable()
    : window.dtrum && window.dtrum.disable();
}
((() => {
  var e = getAnalyticsConsentStatus();
  (initDynaTraceRUM(e),
    window.GOVSignIn.pushCustomEventsToDataLayer(e),
    e ||
      window.addEventListener(
        "cookie-consent",
        () => {
          var e = getAnalyticsConsentStatus();
          (initDynaTraceRUM(e),
            window.GOVSignIn.pushCustomEventsToDataLayer(e));
        },
        { once: !0 }
      ));
})(),
  window.addEventListener("load", (e) => {
    if (
      (initEnterPhoneNumber(),
      window.GOVUK && window.GOVUK.Modules && window.GOVUK.Modules.ShowPassword)
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
  }));
