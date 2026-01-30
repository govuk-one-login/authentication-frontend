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

function tryOrReturnDefault(callback, defaultValue) {
  try {
    return callback();
  } catch (e) {
    return defaultValue;
  }
}

function getAnalyticsConsentStatus() {
  const cookieValue = getCookieValue("cookies_preferences_set");

  if (!cookieValue) return false;

  const cookieConsent = tryOrReturnDefault(
    () => JSON.parse(decodeURIComponent(cookieValue)),
    false
  );
  return cookieConsent ? cookieConsent.analytics === true : false;
}

// ## Custom analytics initialisation

function initDynaTraceRUM(hasConsentedForAnalytics) {
  if (hasConsentedForAnalytics) {
    window.dtrum && window.dtrum.enable();
  } else {
    window.dtrum && window.dtrum.disable();
  }
}

// ### Initialise analytics on page load
(function () {
  const hasConsentedForAnalytics = getAnalyticsConsentStatus();
  initDynaTraceRUM(hasConsentedForAnalytics);
  window.GOVSignIn.pushCustomEventsToDataLayer(hasConsentedForAnalytics);

  if (!hasConsentedForAnalytics) {
    window.addEventListener(
      "cookie-consent",
      () => {
        const newHasConsentedForAnalytics = getAnalyticsConsentStatus();
        initDynaTraceRUM(newHasConsentedForAnalytics);
        window.GOVSignIn.pushCustomEventsToDataLayer(
          newHasConsentedForAnalytics
        );
      },
      { once: true }
    );
  }
})();
