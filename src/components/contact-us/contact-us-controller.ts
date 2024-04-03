import { Request, Response } from "express";
import {
  PATH_NAMES,
  SUPPORT_TYPE,
  CONTACT_US_THEMES,
  CONTACT_US_FIELD_MAX_LENGTH,
  CONTACT_US_COUNTRY_MAX_LENGTH,
  CONTACT_US_REFERER_ALLOWLIST,
} from "../../app.constants";
import { Questions, ThemeQuestions } from "./types";
import { ExpressRouteFunc } from "../../types";
import crypto from "crypto";
import { logger } from "../../utils/logger";
import { getServiceDomain, getSupportLinkUrl } from "../../config";
import { contactUsServiceSmartAgent } from "./contact-us-service-smart-agent";

const oplValues = {
  contactUs: {
    contentId: "e08d04e6-b24f-4bad-9955-1eb860771747",
    taxonomyLevel2: "feedback",
  },
  contactUsFurtherInformation: {
    contentId: "a06d6387-d411-47db-8f7d-88871286330b",
    taxonomyLevel2: "feedback",
  },
  contactUsSuccess: {
    contentId: "0e020971-d828-4679-97fe-23af6e96ab14",
    taxonomyLevel2: "feedback",
  }
};


const themeToPageTitle = {
  [CONTACT_US_THEMES.ACCOUNT_NOT_FOUND]:
    "pages.contactUsQuestions.accountNotFound.title",
  [CONTACT_US_THEMES.TECHNICAL_ERROR]:
    "pages.contactUsQuestions.technicalError.title",
  [CONTACT_US_THEMES.NO_SECURITY_CODE]:
    "pages.contactUsQuestions.noSecurityCode.title",
  [CONTACT_US_THEMES.INVALID_SECURITY_CODE]:
    "pages.contactUsQuestions.invalidSecurityCode.title",
  [CONTACT_US_THEMES.SIGN_IN_PHONE_NUMBER_ISSUE]:
    "pages.contactUsQuestions.signInPhoneNumberIssue.title",
  [CONTACT_US_THEMES.FORGOTTEN_PASSWORD]:
    "pages.contactUsQuestions.forgottenPassword.title",
  [CONTACT_US_THEMES.NO_PHONE_NUMBER_ACCESS]:
    "pages.contactUsQuestions.noPhoneNumberAccess.title",
  [CONTACT_US_THEMES.EMAIL_SUBSCRIPTIONS]:
    "pages.contactUsQuestions.emailSubscriptions.title",
  [CONTACT_US_THEMES.SOMETHING_ELSE]:
    "pages.contactUsQuestions.anotherProblem.title",
  [CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK]:
    "pages.contactUsQuestions.suggestionOrFeedback.title",
  [CONTACT_US_THEMES.PROVING_IDENTITY]:
    "pages.contactUsQuestions.provingIdentity.title",
  [CONTACT_US_THEMES.AUTHENTICATOR_APP_PROBLEM]:
    "pages.contactUsQuestions.authenticatorApp.title",
  [CONTACT_US_THEMES.LINKING_PROBLEM]:
    "pages.contactUsQuestions.linkingProblem.title",
  [CONTACT_US_THEMES.TAKING_PHOTO_OF_ID_PROBLEM]:
    "pages.contactUsQuestions.takingPhotoOfIdProblem.title",
  [CONTACT_US_THEMES.FACE_SCANNING_PROBLEM]:
    "pages.contactUsQuestions.faceScanningProblem.title",
  [CONTACT_US_THEMES.ID_CHECK_APP_TECHNICAL_ERROR]:
    "pages.contactUsQuestions.idCheckAppTechnicalProblem.title",
  [CONTACT_US_THEMES.ID_CHECK_APP_SOMETHING_ELSE]:
    "pages.contactUsQuestions.idCheckAppSomethingElse.title",
  [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_ENTERING_DETAILS]:
    "pages.contactUsQuestions.provingIdentityFaceToFaceDetails.title",
  [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_LETTER]:
    "pages.contactUsQuestions.provingIdentityFaceToFaceLetter.title",
  [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_AT_POST_OFFICE]:
    "pages.contactUsQuestions.provingIdentityFaceToFacePostOffice.title",
  [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_FINDING_RESULT]:
    "pages.contactUsQuestions.provingIdentityFaceToFaceIdResults.title",
  [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_CONTINUING]:
    "pages.contactUsQuestions.provingIdentityFaceToFaceService.title",
  [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_TECHNICAL_PROBLEM]:
    "pages.contactUsQuestions.provingIdentityFaceToFaceTechnicalProblem.title",
  [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_ANOTHER_PROBLEM]:
    "pages.contactUsQuestions.provingIdentityFaceToFaceSomethingElse.title",
  [CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_ANSWERING_SECURITY_QUESTIONS]:
    "pages.contactUsQuestions.provingIdentityProblemAnsweringSecurityQuestions.title",
  [CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_IDENTITY_DOCUMENT]:
    "pages.contactUsQuestions.provingIdentityProblemWithIdentityDocument.title",
  [CONTACT_US_THEMES.PROVING_IDENTITY_NEED_TO_UPDATE_PERSONAL_INFORMATION]:
    "pages.contactUsQuestions.provingIdentityNeedToUpdatePersonalInformation.title",
  [CONTACT_US_THEMES.PROVING_IDENTITY_SOMETHING_ELSE]:
    "pages.contactUsQuestions.provingIdentitySomethingElse.title",
};

const somethingElseSubThemeToPageTitle = {
  [CONTACT_US_THEMES.ACCOUNT_CREATION]:
    "pages.contactUsQuestions.accountCreation.title",
  [CONTACT_US_THEMES.SIGNING_IN]: "pages.contactUsQuestions.signingIn.title",
  [CONTACT_US_THEMES.ID_CHECK_APP_TECHNICAL_ERROR]:
    "pages.contactUsQuestions.idCheckAppTechnicalError.title",
  [CONTACT_US_THEMES.ID_CHECK_APP_SOMETHING_ELSE]:
    "pages.contactUsQuestions.idCheckAppSomethingElse.title",
};

const serviceDomain = getServiceDomain();

export function contactUsGet(req: Request, res: Response): void {
  if (req.query.supportType === SUPPORT_TYPE.GOV_SERVICE) {
    return res.render("contact-us/index-gov-service-contact-us.njk");
  }
  const REFERER = "referer";

  let referer = validateReferer(req.get(REFERER), serviceDomain);
  let fromURL;

  if (req.query.fromURL) {
    fromURL = validateReferer(req.query.fromURL as string, serviceDomain);
    logger.info(`fromURL query param received with value ${fromURL}`);
  }

  if (req.query.referer) {
    referer = validateReferer(req.query.referer as string, serviceDomain);
    logger.info(`referer with referer query param ${referer}`);
  }

  if (req.headers?.referer?.includes(REFERER)) {
    try {
      referer = validateReferer(
        new URL(req.get(REFERER)).searchParams.get(REFERER),
        serviceDomain
      );
      logger.info(`referer with referer header param ${referer}`);
    } catch {
      logger.warn(
        `unable to parse referer with referer param ${req.get(REFERER)}`
      );
    }
  }

  const supportLinkURL = getSupportLinkUrl();
  const backLinkHref = prepareBackLink(req, supportLinkURL, serviceDomain);
  const options = {
    referer: encodeValue(referer),
    fromURL: encodeValue(fromURL),
    hrefBack: backLinkHref,
    ...(getAppSessionId(req.query.appSessionId as string) && {
      appSessionId: getAppSessionId(req.query.appSessionId as string),
    }),
    contentId: oplValues.contactUs.contentId,
    taxonomyLevel2: oplValues.contactUs.taxonomyLevel2,
  };

  return res.render("contact-us/index-public-contact-us.njk", options);
}

function encodeValue(input: string): string {
  try {
    if (input && decodeURIComponent(input) === input) {
      input = encodeURIComponent(input);
    }
  } catch {
    logger.warn(`unable to encode field ${input}`);
    //resetting value as input not in uri format (malicious?)
    input = "";
  }
  return input;
}

export function prepareBackLink(
  req: Request,
  supportLinkURL: string,
  serviceDomain: string
): string {
  let hrefBack: string;

  if (req.path.endsWith(PATH_NAMES.CONTACT_US)) {
    hrefBack = supportLinkURL;
  } else if (req.path.endsWith(PATH_NAMES.CONTACT_US_FURTHER_INFORMATION)) {
    if (
      req.query.fromURL &&
      req.query.theme === CONTACT_US_THEMES.ID_CHECK_APP
    ) {
      hrefBack = supportLinkURL;
    } else {
      hrefBack = PATH_NAMES.CONTACT_US;
    }
  } else if (req.path.endsWith(PATH_NAMES.CONTACT_US_QUESTIONS)) {
    hrefBack = PATH_NAMES.CONTACT_US_FURTHER_INFORMATION;
  } else {
    hrefBack = PATH_NAMES.CONTACT_US;
  }

  const queryParams = new URLSearchParams();

  if (validateReferer(req.query.fromURL as string, serviceDomain)) {
    queryParams.append("fromURL", req.query.fromURL as string);
  }

  if (
    req.query.theme &&
    Object.values(CONTACT_US_THEMES).includes(req.query.theme as string)
  ) {
    queryParams.append("theme", req.query.theme as string);
  }

  return queryParams.toString().length > 0
    ? hrefBack + "?" + queryParams.toString()
    : hrefBack;
}

export function contactUsGetFromTriagePage(req: Request, res: Response): void {
  const queryParams = new URLSearchParams({
    ...(validateAppId(req.query.appSessionId as string) && {
      appSessionId: getAppSessionId(req.query.appSessionId as string),
    }),
    ...(getAppErrorCode(req.query.appErrorCode as string) && {
      appErrorCode: getAppErrorCode(req.query.appErrorCode as string),
    }),
    ...(validateReferer(req.query.fromURL as string, serviceDomain) && {
      fromURL: validateReferer(req.query.fromURL as string, serviceDomain),
    }),
  });

  if (req.query.theme === CONTACT_US_THEMES.ID_CHECK_APP) {
    queryParams.append("theme", req.query.theme);

    return res.redirect(
      PATH_NAMES.CONTACT_US_FURTHER_INFORMATION + "?" + queryParams.toString()
    );
  }

  return res.redirect(PATH_NAMES.CONTACT_US + "?" + queryParams.toString());
}

export function validateAppErrorCode(appErrorCode: string): boolean {
  const testResult = /^(\d|[a-f]){4}$/.test(appErrorCode);

  if (!testResult) {
    logger.warn(`App error code ${appErrorCode} did not meet validation rules`);
  }

  return testResult;
}

export function getAppErrorCode(appErrorCode: string | undefined): string {
  if (!appErrorCode) {
    logger.info(`Error code ${appErrorCode} was falsy`);
    return "";
  }

  return validateAppErrorCode(appErrorCode) ? appErrorCode : "";
}

export function getAppSessionId(appSessionId: string | undefined): string {
  if (!appSessionId) {
    logger.info(`appSessionId ${appSessionId} was falsy`);
    return "";
  }

  return validateAppId(appSessionId) ? appSessionId : "";
}

export function isAppJourney(appSessionId: string): boolean {
  return validateAppId(appSessionId);
}

export function validateAppId(appSessionId: string): boolean {
  const testResult =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      appSessionId
    );

  if (!testResult) {
    logger.warn(`appSessionId ${appSessionId} did not meet validation rules`);
  }

  return testResult;
}

export function validateReferer(
  referer: string,
  serviceDomain: string
): string {
  let valid = false;
  let url;
  try {
    referer = decodeURIComponent(referer);
    if (CONTACT_US_REFERER_ALLOWLIST.includes(referer)) {
      valid = true;
    } else {
      url = new URL(referer);
      valid = url.hostname.endsWith(serviceDomain);
    }
  } catch {
    logger.warn(`unable to parse referer ${referer}`);
  }
  if (valid) {
    logger.info(`referer is empty or a valid url ${referer}`);
  } else {
    logger.warn(`referer is not a valid url ${referer}`);
  }
  return valid ? referer : "";
}

export function getPreferredLanguage(languageCode: string): string {
  if (languageCode === "en") {
    return "English";
  }

  if (languageCode === "cy") {
    return "Welsh";
  }

  return "Language code not set";
}

export function getNextUrlBasedOnTheme(theme: string): string {
  let url: string = PATH_NAMES.CONTACT_US_QUESTIONS;

  if (
    [
      CONTACT_US_THEMES.ACCOUNT_CREATION,
      CONTACT_US_THEMES.SIGNING_IN,
      CONTACT_US_THEMES.ID_CHECK_APP,
      CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE,
      CONTACT_US_THEMES.PROVING_IDENTITY,
    ].includes(theme)
  ) {
    url = PATH_NAMES.CONTACT_US_FURTHER_INFORMATION;
  }

  return url;
}

export function contactUsFormPost(req: Request, res: Response): void {
  const queryParams = new URLSearchParams({
    theme: req.body.theme,
    referer: validateReferer(req.body.referer, serviceDomain),
    ...(validateAppId(req.body.appSessionId) && {
      appSessionId: getAppSessionId(req.body.appSessionId),
    }),
  });

  if (req.body.fromURL) {
    queryParams.append(
      "fromURL",
      validateReferer(req.body.fromURL, serviceDomain)
    );
  }

  res.redirect(
    getNextUrlBasedOnTheme(req.body.theme) + "?" + queryParams.toString()
  );
}

export function furtherInformationGet(req: Request, res: Response): void {
  const supportLinkURL = getSupportLinkUrl();
  const backLinkHref = prepareBackLink(req, supportLinkURL, serviceDomain);

  if (!req.query.theme) {
    return res.redirect(PATH_NAMES.CONTACT_US);
  }

  if (isAppJourney(req.query.appSessionId as string)) {
    return res.render("contact-us/further-information/index.njk", {
      theme: req.query.theme,
      hrefBack: backLinkHref,
      referer: encodeValue(
        validateReferer(req.query.referer as string, serviceDomain)
      ),
      ...(validateReferer(req.query.fromURL as string, serviceDomain) && {
        fromURL: encodeValue(
          validateReferer(req.query.fromURL as string, serviceDomain)
        ),
      }),
      appSessionId: getAppSessionId(req.query.appSessionId as string),
      ...(getAppErrorCode(req.query.appErrorCode as string) && {
        appErrorCode: getAppErrorCode(req.query.appErrorCode as string),
      }),
    });
  }

  return res.render("contact-us/further-information/index.njk", {
    theme: req.query.theme,
    ...(validateReferer(req.query.fromURL as string, serviceDomain) && {
      fromURL: encodeValue(
        validateReferer(req.query.fromURL as string, serviceDomain)
      ),
    }),
    hrefBack: backLinkHref,
    referer: encodeValue(
      validateReferer(req.query.referer as string, serviceDomain)
    ),
    contentId: oplValues.contactUsFurtherInformation.contentId,
    taxonomyLevel2: oplValues.contactUsFurtherInformation.taxonomyLevel2,
  });
}

export function furtherInformationPost(req: Request, res: Response): void {
  const url = PATH_NAMES.CONTACT_US_QUESTIONS;
  const queryParams = new URLSearchParams({
    theme: req.body.theme,
    subtheme: req.body.subtheme,
    referer: validateReferer(req.body.referer, serviceDomain),
    ...(validateReferer(req.body.fromURL, serviceDomain) && {
      fromURL: validateReferer(req.body.fromURL, serviceDomain),
    }),
  });

  if (isAppJourney(req.body.appSessionId)) {
    queryParams.append("appSessionId", getAppSessionId(req.body.appSessionId));
    if (req.body.appErrorCode) {
      queryParams.append(
        "appErrorCode",
        getAppErrorCode(req.body.appErrorCode)
      );
    }
  }

  res.redirect(url + "?" + queryParams.toString());
}

export function contactUsQuestionsGet(req: Request, res: Response): void {
  const supportLinkURL = getSupportLinkUrl();
  const backLinkHref = prepareBackLink(req, supportLinkURL, serviceDomain);

  if (!req.query.theme) {
    return res.redirect(PATH_NAMES.CONTACT_US);
  }
  let pageTitle = themeToPageTitle[req.query.theme as string];
  if (
    req.query.subtheme === CONTACT_US_THEMES.SOMETHING_ELSE &&
    req.query.theme === CONTACT_US_THEMES.ACCOUNT_CREATION
  ) {
    pageTitle = somethingElseSubThemeToPageTitle[req.query.theme as string];
  } else if (req.query.subtheme) {
    pageTitle = themeToPageTitle[req.query.subtheme as string];
  }
  return res.render("contact-us/questions/index.njk", {
    formSubmissionUrl: PATH_NAMES.CONTACT_US_QUESTIONS,
    theme: req.query.theme,
    subtheme: req.query.subtheme,
    backurl: backLinkHref,
    referer: encodeValue(
      validateReferer(req.query.referer as string, serviceDomain)
    ),
    ...(validateReferer(req.query.fromURL as string, serviceDomain) && {
      fromURL: encodeValue(
        validateReferer(req.query.fromURL as string, serviceDomain)
      ),
    }),
    pageTitleHeading: pageTitle,
    contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
    contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
    appErrorCode: getAppErrorCode(req.query.appErrorCode as string),
    appSessionId: getAppSessionId(req.query.appSessionId as string),
  });
}

export function createTicketIdentifier(appSessionId: string): string {
  if (appSessionId) {
    return appSessionId;
  } else {
    return crypto.randomBytes(20).toString("base64url");
  }
}

export function contactUsQuestionsFormPostToSmartAgent(
  service = contactUsServiceSmartAgent()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const ticketIdentifier = createTicketIdentifier(
      getAppSessionId(req.body.appSessionId)
    );

    const questions = getQuestionsFromFormTypeForMessageBody(
      req,
      req.body.formType
    );

    const themeQuestions = getQuestionFromThemes(
      req,
      req.body.theme,
      req.body.subtheme
    );

    await service.contactUsSubmitFormSmartAgent({
      descriptions: {
        issueDescription: req.body.issueDescription,
        additionalDescription: req.body.additionalDescription,
        optionalDescription: req.body.optionalDescription,
        moreDetailDescription: req.body.moreDetailDescription,
        serviceTryingToUse: req.body.serviceTryingToUse,
        countryPhoneNumberFrom: req.body.countryPhoneNumberFrom,
      },
      themes: { theme: req.body.theme, subtheme: req.body.subtheme },
      subject: "GOV.UK One Login",
      email: req.body.email,
      name: req.body.name,
      optionalData: {
        ticketIdentifier: ticketIdentifier,
        userAgent: req.get("User-Agent"),
        appErrorCode: getAppErrorCode(req.body.appErrorCode),
        country: req.body.country,
      },
      feedbackContact: req.body.contact === "true",
      questions: questions,
      themeQuestions: themeQuestions,
      referer: validateReferer(req.body.referer, serviceDomain),
      ...(validateReferer(req.body.fromURL, serviceDomain) && {
        fromURL: validateReferer(req.body.fromURL, serviceDomain),
      }),
      preferredLanguage: getPreferredLanguage(res.locals.language),
      securityCodeSentMethod: req.body.securityCodeSentMethod,
      identityDocumentUsed: req.body.identityDocumentUsed,
    });

    logger.info(
      `Support ticket submitted to SmartAgent with id ${ticketIdentifier} for session ${res.locals.sessionId}`
    );
    return res.redirect(PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS);
  };
}

export function contactUsSubmitSuccessGet(req: Request, res: Response): void {
  res.render("contact-us/index-submit-success.njk", {
    contentId: oplValues.contactUsSuccess.contentId,
    taxonomyLevel2: oplValues.contactUsSuccess.taxonomyLevel2
  });
}

export function getQuestionsFromFormTypeForMessageBody(
  req: Request,
  formType: string
): Questions {
  const formTypeToQuestions: { [key: string]: any } = {
    accountCreationProblem: {
      issueDescription: req.t(
        "pages.contactUsQuestions.accountCreationProblem.section1.paragraph1",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    accountNotFound: {
      issueDescription: req.t(
        "pages.contactUsQuestions.accountNotFound.section1.header",
        { lng: "en" }
      ),
      optionalDescription: req.t(
        "pages.contactUsQuestions.accountNotFound.section2.header",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    anotherProblem: {
      issueDescription: req.t(
        "pages.contactUsQuestions.anotherProblem.section1.header",
        { lng: "en" }
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.anotherProblem.section2.header",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    authenticatorApp: {
      issueDescription: req.t(
        "pages.contactUsQuestions.authenticatorApp.section1.header",
        { lng: "en" }
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.authenticatorApp.section2.header",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    emailSubscription: {
      issueDescription: req.t(
        "pages.contactUsQuestions.emailSubscriptions.section1.header",
        { lng: "en" }
      ),
      optionalDescription: req.t(
        "pages.contactUsQuestions.emailSubscriptions.section2.header",
        { lng: "en" }
      ),
    },
    forgottenPassword: {
      optionalDescription: req.t(
        "pages.contactUsQuestions.forgottenPassword.section1.header",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    invalidSecurityCode: {
      moreDetailDescription: req.t(
        "pages.contactUsQuestions.invalidSecurityCode.section2.header",
        { lng: "en" }
      ),
      radioButtons: req.t(
        "pages.contactUsQuestions.invalidSecurityCode.section1.header",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    noPhoneNumberAccess: {
      optionalDescription: req.t(
        "pages.contactUsQuestions.noPhoneNumberAccess.section2.header",
        { lng: "en" }
      ),
      radioButtons: req.t(
        "pages.contactUsQuestions.noPhoneNumberAccess.section1.header",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    noSecurityCode: {
      moreDetailDescription: req.t(
        "pages.contactUsQuestions.noSecurityCode.section2.header",
        { lng: "en" }
      ),
      radioButtons: req.t(
        "pages.contactUsQuestions.noSecurityCode.section1.header",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    signInPhoneNumberIssue: {
      issueDescription: req.t(
        "pages.contactUsQuestions.signInPhoneNumberIssue.section1.header",
        { lng: "en" }
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.signInPhoneNumberIssue.section2.header",
        { lng: "en" }
      ),
      countryPhoneNumberFrom: req.t(
        "pages.contactUsQuestions.signInPhoneNumberIssue.section3.header",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    signingInProblem: {
      issueDescription: req.t(
        "pages.contactUsQuestions.signignInProblem.section1.header",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    suggestionFeedback: {
      issueDescription: req.t(
        "pages.contactUsQuestions.suggestionOrFeedback.section1.header",
        { lng: "en" }
      ),
    },
    technicalError: {
      issueDescription: req.t(
        "pages.contactUsQuestions.technicalError.section1.header",
        { lng: "en" }
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.technicalError.section2.header",
        { lng: "en" }
      ),
      optionalDescription: req.t(
        "pages.contactUsQuestions.technicalError.section3.header",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    provingIdentity: {
      issueDescription: req.t(
        "pages.contactUsQuestions.provingIdentity.section1.header",
        { lng: "en" }
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.provingIdentity.section2.header",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    idCheckApp: {
      issueDescription: `${req.t(
        "pages.contactUsQuestions.whatHappened.header",
        { lng: "en" }
      )} ${req.t("pages.contactUsQuestions.whatHappened.paragraph1", {
        lng: "en",
      })}`,
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    idCheckAppPhotoProblem: {
      issueDescription: `${req.t(
        "pages.contactUsQuestions.whatHappened.header",
        { lng: "en" }
      )} ${req.t("pages.contactUsQuestions.whatHappened.paragraph1", {
        lng: "en",
      })}`,
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
      radioButtons: req.t(
        "pages.contactUsQuestions.takingPhotoOfIdProblem.identityDocument.header",
        { lng: "en" }
      ),
    },
    idCheckAppTechnicalProblem: {
      issueDescription: req.t(
        "pages.contactUsQuestions.idCheckAppTechnicalProblem.section1.header",
        { lng: "en" }
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.whatHappened.header",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    idCheckAppSomethingElse: {
      issueDescription: req.t(
        "pages.contactUsQuestions.idCheckAppSomethingElse.section1.header",
        { lng: "en" }
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.whatHappened.header",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    provingIdentityFaceToFace: {
      issueDescription: req.t(
        "pages.contactUsQuestions.provingIdentityFaceToFaceDetails.whatHappened.label",
        {
          lng: "en",
        }
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.whatHappened.header",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    provingIdentityFaceToFaceTechnicalProblem: {
      issueDescription: req.t(
        "pages.contactUsQuestions.provingIdentityFaceToFaceTechnicalProblem.section1.title",
        {
          lng: "en",
        }
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.whatHappened.header",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    provingIdentityFaceToFaceSomethingElse: {
      issueDescription: req.t(
        "pages.contactUsQuestions.provingIdentityFaceToFaceSomethingElse.section1.header",
        {
          lng: "en",
        }
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.provingIdentityFaceToFaceSomethingElse.section2.header",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    provingIdentityProblemAnsweringSecurityQuestions: {
      issueDescription: req.t(
        "pages.contactUsQuestions.provingIdentityProblemAnsweringSecurityQuestions.section1.label",
        { lng: "en" }
      ),
    },
    provingIdentityProblemWithIdentityDocument: {
      issueDescription: req.t(
        "pages.contactUsQuestions.provingIdentityProblemWithIdentityDocument.section2.label",
        { lng: "en" }
      ),
    },
    provingIdentityNeedToUpdatePersonalInformation: {
      issueDescription: req.t(
        "pages.contactUsQuestions.provingIdentityNeedToUpdatePersonalInformation.section1.label",
        { lng: "en" }
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.provingIdentityNeedToUpdatePersonalInformation.section2.label",
        { lng: "en" }
      ),
    },
    provingIdentitySomethingElse: {
      issueDescription: req.t(
        "pages.contactUsQuestions.provingIdentitySomethingElse.section1.label",
        { lng: "en" }
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.provingIdentitySomethingElse.section2.label",
        { lng: "en" }
      ),
    },
  };

  return formTypeToQuestions[formType];
}

export function getQuestionFromThemes(
  req: Request,
  theme: string,
  subtheme?: string
): ThemeQuestions {
  const themesToQuestions: { [key: string]: any } = {
    account_creation: req.t("pages.contactUsPublic.section3.accountCreation", {
      lng: "en",
    }),
    signing_in: req.t("pages.contactUsPublic.section3.signingIn", {
      lng: "en",
    }),
    proving_identity: req.t("pages.contactUsPublic.section3.provingIdentity", {
      lng: "en",
    }),
    something_else: req.t("pages.contactUsPublic.section3.somethingElse", {
      lng: "en",
    }),
    email_subscriptions: req.t(
      "pages.contactUsPublic.section3.emailSubscriptions",
      { lng: "en" }
    ),
    suggestions_feedback: req.t(
      "pages.contactUsPublic.section3.suggestionsFeedback",
      { lng: "en" }
    ),
    id_check_app: req.t("pages.contactUsPublic.section3.idCheckApp", {
      lng: "en",
    }),
    id_face_to_face: req.t(
      "pages.contactUsPublic.section3.provingIdentityFaceToFace",
      {
        lng: "en",
      }
    ),
  };
  const signinSubthemeToQuestions: { [key: string]: any } = {
    no_security_code: req.t(
      "pages.contactUsFurtherInformation.signingIn.section1.radio1",
      { lng: "en" }
    ),
    invalid_security_code: req.t(
      "pages.contactUsFurtherInformation.signingIn.section1.radio2",
      { lng: "en" }
    ),
    no_phone_number_access: req.t(
      "pages.contactUsFurtherInformation.signingIn.section1.radio3",
      { lng: "en" }
    ),
    forgotten_password: req.t(
      "pages.contactUsFurtherInformation.signingIn.section1.radio4",
      { lng: "en" }
    ),
    account_not_found: req.t(
      "pages.contactUsFurtherInformation.signingIn.section1.radio5",
      { lng: "en" }
    ),
    technical_error: req.t(
      "pages.contactUsFurtherInformation.signingIn.section1.radio6",
      { lng: "en" }
    ),
    something_else: req.t(
      "pages.contactUsFurtherInformation.signingIn.section1.radio7",
      { lng: "en" }
    ),
  };
  const accountCreationSubthemeToQuestions: { [key: string]: any } = {
    no_security_code: req.t(
      "pages.contactUsFurtherInformation.accountCreation.section1.radio1",
      { lng: "en" }
    ),
    invalid_security_code: req.t(
      "pages.contactUsFurtherInformation.accountCreation.section1.radio2",
      { lng: "en" }
    ),
    sign_in_phone_number_issue: req.t(
      "pages.contactUsFurtherInformation.accountCreation.section1.radio3",
      { lng: "en" }
    ),
    technical_error: req.t(
      "pages.contactUsFurtherInformation.accountCreation.section1.radio4",
      { lng: "en" }
    ),
    something_else: req.t(
      "pages.contactUsFurtherInformation.accountCreation.section1.radio5",
      { lng: "en" }
    ),
    authenticator_app_problem: req.t(
      "pages.contactUsFurtherInformation.accountCreation.section1.radio6",
      { lng: "en" }
    ),
  };

  const idCheckAppSubthemeToQuestions: { [key: string]: any } = {
    linking_problem: req.t(
      "pages.contactUsFurtherInformation.idCheckApp.section1.linkingProblem",
      { lng: "en" }
    ),
    taking_photo_of_id_problem: req.t(
      "pages.contactUsFurtherInformation.idCheckApp.section1.photoProblem",
      { lng: "en" }
    ),
    face_scanning_problem: req.t(
      "pages.contactUsFurtherInformation.idCheckApp.section1.faceScanningProblem",
      { lng: "en" }
    ),
    id_check_app_technical_problem: req.t(
      "pages.contactUsFurtherInformation.idCheckApp.section1.technicalError",
      { lng: "en" }
    ),
    id_check_app_something_else: req.t(
      "pages.contactUsFurtherInformation.idCheckApp.section1.somethingElse",
      { lng: "en" }
    ),
  };

  const provingIdentityFaceToFaceSubthemeToQuestion: { [key: string]: any } = {
    face_to_face_details: req.t(
      "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemEnteringDetails",
      { lng: "en" }
    ),
    face_to_face_letter: req.t(
      "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemPostOfficeLetter",
      { lng: "en" }
    ),
    face_to_face_post_office: req.t(
      "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemAtPostOffice",
      { lng: "en" }
    ),
    face_to_face_post_office_id_results: req.t(
      "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemFindingResult",
      { lng: "en" }
    ),
    face_to_face_post_office_service: req.t(
      "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemContinuing",
      { lng: "en" }
    ),
    face_to_face_technical_problem: req.t(
      "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.technicalProblem",
      { lng: "en" }
    ),
    face_to_face_something_else: req.t(
      "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.anotherProblem",
      { lng: "en" }
    ),
  };

  const provingIdentitySubthemeToQuestion: { [key: string]: any } = {
    proving_identity_problem_answering_security_questions: req.t(
      "pages.contactUsQuestions.provingIdentityProblemAnsweringSecurityQuestions.title",
      { lng: "en" }
    ),
    proving_identity_problem_with_identity_document: req.t(
      "pages.contactUsQuestions.provingIdentityProblemWithIdentityDocument.title",
      { lng: "en" }
    ),
    proving_identity_need_to_update_personal_information: req.t(
      "pages.contactUsQuestions.provingIdentityNeedToUpdatePersonalInformation.title",
      { lng: "en" }
    ),
    proving_identity_something_else: req.t(
      "pages.contactUsQuestions.provingIdentitySomethingElse.title",
      { lng: "en" }
    ),
  };

  const themeQuestion = themesToQuestions[theme];
  let subthemeQuestion;
  if (subtheme) {
    if (theme == CONTACT_US_THEMES.ACCOUNT_CREATION) {
      subthemeQuestion = accountCreationSubthemeToQuestions[subtheme];
    }
    if (theme == CONTACT_US_THEMES.SIGNING_IN) {
      subthemeQuestion = signinSubthemeToQuestions[subtheme];
    }
    if (theme == CONTACT_US_THEMES.ID_CHECK_APP) {
      subthemeQuestion = idCheckAppSubthemeToQuestions[subtheme];
    }
    if (theme == CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE) {
      subthemeQuestion = provingIdentityFaceToFaceSubthemeToQuestion[subtheme];
    }
    if (theme == CONTACT_US_THEMES.PROVING_IDENTITY) {
      subthemeQuestion = provingIdentitySubthemeToQuestion[subtheme];
    }
  }
  return {
    themeQuestion,
    subthemeQuestion,
  };
}
