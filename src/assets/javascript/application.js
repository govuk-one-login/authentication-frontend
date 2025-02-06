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

// ## Cookie handling

function getCookieValue(cookieName) {
  const cookies_arr = document.cookie.split(";");
  let value;
  cookies_arr.forEach((item) => {
    const name = item.split("=")[0].toLowerCase().trim();
    if (name.indexOf(cookieName) !== -1) {
      value = item.split("=")[1];
    }
  });
  return value;
}

function getAnalyticsConsentStatus() {
  const cookieValue = getCookieValue("cookies_preferences_set");

  if (!cookieValue) return false;

  const cookieConsent = JSON.parse(decodeURIComponent(cookieValue));
  return cookieConsent ? cookieConsent.analytics === true : false;
}

// ## Custom analytics initialisation

function initDtrum(hasConsentedForAnalytics) {
  if (hasConsentedForAnalytics) {
    console.log("🟣 appInit - dtrum - has consented");
    window.dtrum && window.dtrum.enable();
  } else {
    console.log("🟣 appInit - dtrum - not consented");
    window.dtrum && window.dtrum.disable();
  }
}

// ### Initialise analytics on page load
(function () {
  console.log("🟢 page load init");
  const hasConsentedForAnalytics = getAnalyticsConsentStatus();
  initDtrum(hasConsentedForAnalytics);
  window.GOVSignIn.pushCustomEventsToDataLayer(hasConsentedForAnalytics);

  if (!hasConsentedForAnalytics) {
    window.addEventListener(
      "cookie-consent",
      () => {
        console.log("🟠 cookie-consent init");

        const newHasConsentedForAnalytics = getAnalyticsConsentStatus();
        initDtrum(newHasConsentedForAnalytics);
        window.GOVSignIn.pushCustomEventsToDataLayer(
          newHasConsentedForAnalytics
        );
      },
      { once: true }
    );
  }
})();

window.addEventListener("load", (event) => {
  window.GOVUKFrontend.initAll();
  initEnterPhoneNumber();

  if (
    window.GOVUK &&
    window.GOVUK.Modules &&
    window.GOVUK.Modules.ShowPassword
  ) {
    var modules = document.querySelectorAll('[data-module="show-password"]');

    for (var i = 0, l = modules.length; i < l; i++) {
      if (GOVUK.Modules.ShowPassword.prototype.init) {
        new GOVUK.Modules.ShowPassword(modules[i]).init();
      }
    }
  }
});
