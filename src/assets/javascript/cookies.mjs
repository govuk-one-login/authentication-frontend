let analyticsCookieDomain, cookiesAccepted, cookiesRejected, hideCookieBanner, cookieBannerContainer, cookieBanner, acceptCookies, rejectCookies;
const COOKIES_PREFERENCES_SET = "cookies_preferences_set";

const init = (analyticsCookieDomain) => {
  analyticsCookieDomain = analyticsCookieDomain;
  cookiesAccepted = document.querySelector("#cookies-accepted");
  cookiesRejected = document.querySelector("#cookies-rejected");
  hideCookieBanner = document.querySelectorAll(".cookie-hide-button");
  cookieBannerContainer = document.querySelector(".govuk-cookie-banner");
  cookieBanner = document.querySelector("#cookies-banner-main");
  acceptCookies = document.querySelector('button[name="cookiesAccept"]');
  rejectCookies = document.querySelector('button[name="cookiesReject"]');

  acceptCookies.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      setBannerCookieConsent(true);
    }
  );

  rejectCookies.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      setBannerCookieConsent(false);
    }
  );

  const hideButtons = Array.prototype.slice.call(hideCookieBanner);
  hideButtons.forEach((element) => {
    element.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        hideElement(cookieBannerContainer);
      }
    );
  });
  
  const hasCookiesPolicy = getCookie(COOKIES_PREFERENCES_SET);
  if (!hasCookiesPolicy) {
    showElement(cookieBannerContainer);
  }
}

const setBannerCookieConsent = (analyticsConsent) => {
  setCookie(
    COOKIES_PREFERENCES_SET,
    { analytics: analyticsConsent },
    { days: 365 }
  );

  hideElement(cookieBanner);

  if (analyticsConsent) {
    showElement(cookiesAccepted);

    var event
    if (typeof window.CustomEvent === 'function') {
      event = new window.CustomEvent("cookie-consent")
    } else {
      event = document.createEvent('CustomEvent')
      event.initCustomEvent("cookie-consent")
    }
    window.dispatchEvent(event)
  } else {
    showElement(cookiesRejected);
  }
}

const hideElement = (el) => {
  el.style.display = "none";
}

const showElement = (el) => {
  el.style.display = "block";
}
  
const setCookie = (name, values, options) => {
  if (typeof options === "undefined") {
    options = {};
  }

  let cookieString = name + "=" + JSON.stringify(values);
  if (options.days) {
    var date = new Date();
    date.setTime(date.getTime() + options.days * 24 * 60 * 60 * 1000);
    cookieString =
      cookieString +
      "; expires=" +
      date.toGMTString() +
      "; path=/;" +
      " domain=" +
      analyticsCookieDomain +
      ";";
  }

  if (document.location.protocol === "https:") {
    cookieString = cookieString + "; Secure";
  }
  document.cookie = cookieString;
}

const getCookie = (name) => {
  const nameEQ = name + "=";

  const cookies = document.cookie.split(";");
  for (let i = 0, len = cookies.length; i < len; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
}

const hasConsentForAnalytics = () => {
  const cookieConsent = JSON.parse(getCookie(COOKIES_PREFERENCES_SET));
  return cookieConsent ? cookieConsent.analytics : false;
}

export default { init, getCookie, setCookie, hasConsentForAnalytics };