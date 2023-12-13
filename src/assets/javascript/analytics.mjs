let uaTrackingId, dataLayer;

const init = (uaTrackingId) => {
  dataLayer = [
    {
      "gtm.allowlist": ["google"],
      "gtm.blocklist": ["adm", "awct", "sp", "gclidw", "gcs", "opt"],
    },
    {
      department: {
        programmeteam: "di",
        productteam: "sso",
      },
    }
  ];
  dataLayer.push({ 
    "gtm.start": new Date().getTime(), 
    event: "gtm.js" 
  });
  uaTrackingId = uaTrackingId;

  loadGtm();
  addSessionJourneyToDataLayer();
  pushLanguageToDataLayer();
  pushABTestVariantToDataLayer();
  initLinkerHandlers();
}

const loadGtm = () => {
  const gtmScriptTag = document.createElement("script");
  gtmScriptTag.type = "text/javascript";
  gtmScriptTag.setAttribute("async", "true");
  gtmScriptTag.setAttribute(
    "src",
    "https://www.googletagmanager.com/gtm.js?id=" + uaTrackingId
  );
  gtmScriptTag.setAttribute("crossorigin", "anonymous");
  document.documentElement.firstChild.appendChild(gtmScriptTag);
}

const addSessionJourneyToDataLayer = () => {
  const url = window.location.search.includes("type")
  ? window.location.pathname + window.location.search
  : window.location.pathname;
  const sessionJourney = getJourneyMapping(url);

  if (sessionJourney) {
    dataLayer.push(sessionJourney);
  }
}

const getJourneyMapping = (url) => {
  const JOURNEY_DATA_LAYER_PATHS = {
    "/manage-your-account": {
      sessionjourney: {
        journey: "account management",
      },
    },
    "/enter-password?type=changeEmail": generateJourneySession(
      "change email",
      "start"
    ),
    "/change-email": generateJourneySession("change email", "middle"),
    "/check-your-email": generateJourneySession("change email", "middle"),
    "/email-updated-confirmation": generateJourneySession(
      "change email",
      "end"
    ),
    "/enter-password?type=changePhoneNumber": generateJourneySession(
      "change phone number",
      "start"
    ),
    "/change-phone-number": generateJourneySession(
      "change phone number",
      "middle"
    ),
    "/check-your-phone": generateJourneySession(
      "change phone number",
      "middle"
    ),
    "/phone-number-updated-confirmation": generateJourneySession(
      "change phone number",
      "end"
    ),
    "/enter-password?type=changePassword": generateJourneySession(
      "change password",
      "start"
    ),
    "/change-password": generateJourneySession("change password", "middle"),
    "/password-updated-confirmation": generateJourneySession(
      "change password",
      "end"
    ),
    "/enter-password?type=deleteAccount": generateJourneySession(
      "delete account",
      "start"
    ),
    "/delete-account": generateJourneySession("delete account", "middle"),
    "/account-deleted-confirmation": generateJourneySession(
      "delete account",
      "end"
    ),
  };

  return JOURNEY_DATA_LAYER_PATHS[url];
}

const generateJourneySession = (type, status) => {
  return {
    sessionjourney: {
      journey: "account management",
      type: type,
      status: status,
    },
  };
}

const pushLanguageToDataLayer = () => {
  const languageCode = document.querySelector('html') &&
      document.querySelector('html').getAttribute('lang');

  const languageNames = {
    'en':'english',
    'cy':'welsh'
  }

  if (languageCode && languageNames[languageCode]) {
    dataLayer.push({
      event: "langEvent",        
      language: languageNames[languageCode],
      languagecode: languageCode
    });
  }
}

const pushABTestVariantToDataLayer = () => {
  const path = window.location.pathname;

  if (path === '/create-password') {
    const matchedElement = document.querySelector('[data-ab-test]');

    if (matchedElement && matchedElement.dataset.abTest) {
      dataLayer.push({
        event: "abTestEvent",
        variant: matchedElement.dataset.abTest,
        page: path
      });
    }
  }
}

const initLinkerHandlers = () => {
  const submitButton = document.querySelector('button[type="submit"]');
  const pageForm = document.getElementById("form-tracking");
  if (submitButton && pageForm) {
    submitButton.addEventListener("click", () => {
      if (window.ga && window.gaplugins) {
        const tracker = window.ga.getAll()[0];
        const linker = new window.gaplugins.Linker(tracker);
        const destinationLink = linker.decorate(pageForm.action);
        pageForm.action = destinationLink;
      }
    });
  }

  const trackLink = document.getElementById("track-link");
  if (trackLink) {
    trackLink.addEventListener("click", (event) => {
      event.preventDefault();

      if (window.ga && window.gaplugins) {
        const tracker = window.ga.getAll()[0];
        const linker = new window.gaplugins.Linker(tracker);
        const destinationLink = linker.decorate(trackLink.href);
        window.location.href = destinationLink;
      } else {
        window.location.href = trackLink.href;
      }
    });
  }
}

const getDataLayer = () => {
  return dataLayer;
}

export default { init, getDataLayer };