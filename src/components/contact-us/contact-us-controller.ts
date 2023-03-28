import { Request, Response } from "express";
import {
  PATH_NAMES,
  SUPPORT_TYPE,
  ZENDESK_THEMES,
  ZENDESK_FIELD_MAX_LENGTH,
  CONTACT_US_REFERER_ALLOWLIST,
} from "../../app.constants";
import { contactUsService } from "./contact-us-service";
import { ContactUsServiceInterface, Questions, ThemeQuestions } from "./types";
import { ExpressRouteFunc } from "../../types";
import crypto from "crypto";
import { logger } from "../../utils/logger";
import { getServiceDomain } from "../../config";

const themeToPageTitle = {
  [ZENDESK_THEMES.ACCOUNT_NOT_FOUND]:
    "pages.contactUsQuestions.accountNotFound.title",
  [ZENDESK_THEMES.TECHNICAL_ERROR]:
    "pages.contactUsQuestions.technicalError.title",
  [ZENDESK_THEMES.NO_SECURITY_CODE]:
    "pages.contactUsQuestions.noSecurityCode.title",
  [ZENDESK_THEMES.INVALID_SECURITY_CODE]:
    "pages.contactUsQuestions.invalidSecurityCode.title",
  [ZENDESK_THEMES.NO_UK_MOBILE_NUMBER]:
    "pages.contactUsQuestions.noUKMobile.title",
  [ZENDESK_THEMES.FORGOTTEN_PASSWORD]:
    "pages.contactUsQuestions.forgottenPassword.title",
  [ZENDESK_THEMES.NO_PHONE_NUMBER_ACCESS]:
    "pages.contactUsQuestions.noPhoneNumberAccess.title",
  [ZENDESK_THEMES.EMAIL_SUBSCRIPTIONS]:
    "pages.contactUsQuestions.emailSubscriptions.title",
  [ZENDESK_THEMES.SOMETHING_ELSE]:
    "pages.contactUsQuestions.anotherProblem.title",
  [ZENDESK_THEMES.SUGGESTIONS_FEEDBACK]:
    "pages.contactUsQuestions.suggestionOrFeedback.title",
  [ZENDESK_THEMES.PROVING_IDENTITY]:
    "pages.contactUsQuestions.provingIdentity.title",
  [ZENDESK_THEMES.AUTHENTICATOR_APP_PROBLEM]:
    "pages.contactUsQuestions.authenticatorApp.title",
  [ZENDESK_THEMES.LINKING_PROBLEM]:
    "pages.contactUsQuestions.linkingProblem.title",
  [ZENDESK_THEMES.TAKING_PHOTO_OF_ID_PROBLEM]:
    "pages.contactUsQuestions.takingPhotoOfIdProblem.title",
  [ZENDESK_THEMES.FACE_SCANNING_PROBLEM]:
    "pages.contactUsQuestions.faceScanningProblem.title",
  [ZENDESK_THEMES.ID_CHECK_APP_TECHNICAL_ERROR]:
    "pages.contactUsQuestions.idCheckAppTechnicalProblem.title",
  [ZENDESK_THEMES.ID_CHECK_APP_SOMETHING_ELSE]:
    "pages.contactUsQuestions.idCheckAppSomethingElse.title",
};

const somethingElseSubThemeToPageTitle = {
  [ZENDESK_THEMES.ACCOUNT_CREATION]:
    "pages.contactUsQuestions.accountCreation.title",
  [ZENDESK_THEMES.SIGNING_IN]: "pages.contactUsQuestions.signingIn.title",
  [ZENDESK_THEMES.ID_CHECK_APP_TECHNICAL_ERROR]:
    "pages.contactUsQuestions.idCheckAppTechnicalError.title",
  [ZENDESK_THEMES.ID_CHECK_APP_SOMETHING_ELSE]:
    "pages.contactUsQuestions.idCheckAppSomethingElse.title",
};

export function contactUsGet(req: Request, res: Response): void {
  if (req.query.supportType === SUPPORT_TYPE.GOV_SERVICE) {
    return res.render("contact-us/index-gov-service-contact-us.njk");
  }
  const REFERER = "referer";

  let referer = validateReferer(req.get(REFERER));

  if (req.query.referer) {
    referer = validateReferer(req.query.referer as string);
    logger.info(`referer with referer query param ${referer}`);
  }

  if (req.headers?.referer?.includes(REFERER)) {
    try {
      referer = validateReferer(
        new URL(req.get(REFERER)).searchParams.get(REFERER)
      );
      logger.info(`referer with referer header param ${referer}`);
    } catch {
      logger.warn(
        `unable to parse referer with referer param ${req.get(REFERER)}`
      );
    }
  }

  return res.render("contact-us/index-public-contact-us.njk", {
    referer: referer,
  });
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

function validateReferer(referer: string): string {
  let valid = false;
  let url;
  try {
    if (CONTACT_US_REFERER_ALLOWLIST.includes(referer)) {
      valid = true;
    } else {
      url = new URL(referer);
      valid = url.hostname.endsWith(getServiceDomain());
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

export function contactUsFormPost(req: Request, res: Response): void {
  let url = PATH_NAMES.CONTACT_US_QUESTIONS;
  const queryParams = new URLSearchParams({
    theme: req.body.theme,
    referer: validateReferer(req.body.referer),
  }).toString();
  if (
    [
      ZENDESK_THEMES.ACCOUNT_CREATION,
      ZENDESK_THEMES.SIGNING_IN,
      ZENDESK_THEMES.ID_CHECK_APP,
    ].includes(req.body.theme)
  ) {
    url = PATH_NAMES.CONTACT_US_FURTHER_INFORMATION;
  }
  res.redirect(url + "?" + queryParams);
}

export function furtherInformationGet(req: Request, res: Response): void {
  if (!req.query.theme) {
    return res.redirect(PATH_NAMES.CONTACT_US);
  }

  if (req.query.appErrorCode && req.query.appSessionId) {
    return res.render("contact-us/further-information/index.njk", {
      theme: req.query.theme,
      referer: validateReferer(req.query.referer as string),
      appErrorCode: getAppErrorCode(req.query.appErrorCode as string),
      appSessionId: getAppSessionId(req.query.appSessionId as string),
    });
  }

  return res.render("contact-us/further-information/index.njk", {
    theme: req.query.theme,
    referer: validateReferer(req.query.referer as string),
  });
}

export function furtherInformationPost(req: Request, res: Response): void {
  const url = PATH_NAMES.CONTACT_US_QUESTIONS;
  const queryParams = new URLSearchParams({
    theme: req.body.theme,
    subtheme: req.body.subtheme,
    referer: validateReferer(req.body.referer),
  });

  if (req.body.appErrorCode && req.body.appSessionId) {
    queryParams.append("appErrorCode", getAppErrorCode(req.body.appErrorCode));
    queryParams.append("appSessionId", getAppSessionId(req.body.appSessionId));
  }

  res.redirect(url + "?" + queryParams.toString());
}

export function contactUsQuestionsGet(req: Request, res: Response): void {
  if (!req.query.theme) {
    return res.redirect(PATH_NAMES.CONTACT_US);
  }
  let pageTitle = themeToPageTitle[req.query.theme as string];
  if (
    req.query.subtheme === ZENDESK_THEMES.SOMETHING_ELSE &&
    req.query.theme === ZENDESK_THEMES.ACCOUNT_CREATION
  ) {
    pageTitle = somethingElseSubThemeToPageTitle[req.query.theme as string];
  } else if (req.query.subtheme) {
    pageTitle = themeToPageTitle[req.query.subtheme as string];
  }
  return res.render("contact-us/questions/index.njk", {
    theme: req.query.theme,
    subtheme: req.query.subtheme,
    backurl: validateReferer(req.headers.referer),
    referer: validateReferer(req.query.referer as string),
    pageTitleHeading: pageTitle,
    zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
    ipnSupport: res.locals.ipnSupport,
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

export function contactUsQuestionsFormPost(
  service: ContactUsServiceInterface = contactUsService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const questions = getQuestionsFromFormType(req, req.body.formType);
    const themeQuestions = getQuestionFromThemes(
      req,
      req.body.theme,
      req.body.subtheme
    );

    const ticketIdentifier = createTicketIdentifier(
      getAppSessionId(req.body.appSessionId)
    );

    await service.contactUsSubmitForm({
      descriptions: {
        issueDescription: req.body.issueDescription,
        additionalDescription: req.body.additionalDescription,
        optionalDescription: req.body.optionalDescription,
        moreDetailDescription: req.body.moreDetailDescription,
        serviceTryingToUse: req.body.serviceTryingToUse,
      },
      themes: { theme: req.body.theme, subtheme: req.body.subtheme },
      subject: "GOV.UK Accounts Feedback",
      email: req.body.email,
      name: req.body.name,
      optionalData: {
        ticketIdentifier: ticketIdentifier,
        userAgent: req.get("User-Agent"),
        appErrorCode: getAppErrorCode(req.body.appErrorCode),
      },
      feedbackContact: req.body.contact === "true",
      questions: questions,
      themeQuestions: themeQuestions,
      referer: validateReferer(req.body.referer),
      securityCodeSentMethod: req.body.securityCodeSentMethod,
    });

    logger.info(
      `Support ticket submitted with id ${ticketIdentifier} for session ${res.locals.sessionId}`
    );
    return res.redirect(PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS);
  };
}

export function contactUsSubmitSuccessGet(req: Request, res: Response): void {
  res.render("contact-us/index-submit-success.njk");
}

export function getQuestionsFromFormType(
  req: Request,
  formType: string
): Questions {
  const formTypeToQuestions: { [key: string]: any } = {
    accountCreationProblem: {
      issueDescription: req.t(
        "pages.contactUsQuestions.accountCreationProblem.section1.paragraph1"
      ),
    },
    accountNotFound: {
      issueDescription: req.t(
        "pages.contactUsQuestions.accountNotFound.section1.header"
      ),
      optionalDescription: req.t(
        "pages.contactUsQuestions.accountNotFound.section2.header"
      ),
    },
    anotherProblem: {
      issueDescription: req.t(
        "pages.contactUsQuestions.anotherProblem.section1.header"
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.anotherProblem.section2.header"
      ),
    },
    authenticatorApp: {
      issueDescription: req.t(
        "pages.contactUsQuestions.authenticatorApp.section1.header"
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.authenticatorApp.section2.header"
      ),
    },
    emailSubscription: {
      issueDescription: req.t(
        "pages.contactUsQuestions.emailSubscriptions.section1.header"
      ),
      optionalDescription: req.t(
        "pages.contactUsQuestions.emailSubscriptions.section2.header"
      ),
    },
    forgottenPassword: {
      optionalDescription: req.t(
        "pages.contactUsQuestions.forgottenPassword.section1.header"
      ),
    },
    invalidSecurityCode: {
      moreDetailDescription: req.t(
        "pages.contactUsQuestions.invalidSecurityCode.section2.header"
      ),
      radioButtons: req.t(
        "pages.contactUsQuestions.invalidSecurityCode.section1.header"
      ),
    },
    noPhoneNumberAccess: {
      optionalDescription: req.t(
        "pages.contactUsQuestions.noPhoneNumberAccess.section2.header"
      ),
      radioButtons: req.t(
        "pages.contactUsQuestions.noPhoneNumberAccess.section1.header"
      ),
    },
    noSecurityCode: {
      moreDetailDescription: req.t(
        "pages.contactUsQuestions.noSecurityCode.section2.header"
      ),
      radioButtons: req.t(
        "pages.contactUsQuestions.noSecurityCode.section1.header"
      ),
    },
    noUKMobile: {
      moreDetailDescription: req.t(
        "pages.contactUsQuestions.noUKMobile.section1.header"
      ),
    },
    signingInProblem: {
      issueDescription: req.t(
        "pages.contactUsQuestions.signignInProblem.section1.header"
      ),
    },
    suggestionFeedback: {
      issueDescription: req.t(
        "pages.contactUsQuestions.suggestionOrFeedback.section1.header"
      ),
    },
    technicalError: {
      issueDescription: req.t(
        "pages.contactUsQuestions.technicalError.section1.header"
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.technicalError.section2.header"
      ),
      optionalDescription: req.t(
        "pages.contactUsQuestions.technicalError.section3.header"
      ),
    },
    provingIdentity: {
      issueDescription: req.t(
        "pages.contactUsQuestions.provingIdentity.section1.header"
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.provingIdentity.section2.header"
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header"
      ),
    },
    idCheckApp: {
      issueDescription: `${req.t(
        "pages.contactUsQuestions.whatHappened.header"
      )} ${req.t("pages.contactUsQuestions.whatHappened.paragraph1")}`,
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header"
      ),
    },
    idCheckAppTechnicalProblem: {
      issueDescription: req.t(
        "pages.contactUsQuestions.idCheckAppTechnicalProblem.section1.header"
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.whatHappened.header"
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header"
      ),
    },
    idCheckAppSomethingElse: {
      issueDescription: req.t(
        "pages.contactUsQuestions.idCheckAppSomethingElse.section1.header"
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.whatHappened.header"
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header"
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
    account_creation: req.t("pages.contactUsPublic.section3.accountCreation"),
    signing_in: req.t("pages.contactUsPublic.section3.signingIn"),
    proving_identity: req.t("pages.contactUsPublic.section3.provingIdentity"),
    something_else: req.t("pages.contactUsPublic.section3.somethingElse"),
    email_subscriptions: req.t(
      "pages.contactUsPublic.section3.emailSubscriptions"
    ),
    suggestions_feedback: req.t(
      "pages.contactUsPublic.section3.suggestionsFeedback"
    ),
    id_check_app: req.t("pages.contactUsPublic.section3.idCheckApp"),
  };
  const signinSubthemeToQuestions: { [key: string]: any } = {
    no_security_code: req.t(
      "pages.contactUsFurtherInformation.signingIn.section1.radio1"
    ),
    invalid_security_code: req.t(
      "pages.contactUsFurtherInformation.signingIn.section1.radio2"
    ),
    no_phone_number_access: req.t(
      "pages.contactUsFurtherInformation.signingIn.section1.radio3"
    ),
    forgotten_password: req.t(
      "pages.contactUsFurtherInformation.signingIn.section1.radio4"
    ),
    account_not_found: req.t(
      "pages.contactUsFurtherInformation.signingIn.section1.radio5"
    ),
    technical_error: req.t(
      "pages.contactUsFurtherInformation.signingIn.section1.radio6"
    ),
    something_else: req.t(
      "pages.contactUsFurtherInformation.signingIn.section1.radio7"
    ),
  };
  const accountCreationSubthemeToQuestions: { [key: string]: any } = {
    no_security_code: req.t(
      "pages.contactUsFurtherInformation.accountCreation.section1.radio1"
    ),
    invalid_security_code: req.t(
      "pages.contactUsFurtherInformation.accountCreation.section1.radio2"
    ),
    no_uk_mobile_number: req.t(
      "pages.contactUsFurtherInformation.accountCreation.section1.radio3"
    ),
    technical_error: req.t(
      "pages.contactUsFurtherInformation.accountCreation.section1.radio4"
    ),
    something_else: req.t(
      "pages.contactUsFurtherInformation.accountCreation.section1.radio5"
    ),
    authenticator_app_problem: req.t(
      "pages.contactUsFurtherInformation.accountCreation.section1.radio6"
    ),
  };

  const idCheckAppSubthemeToQuestions: { [key: string]: any } = {
    linking_problem: req.t(
      "pages.contactUsFurtherInformation.idCheckApp.section1.linkingProblem"
    ),
    taking_photo_of_id_problem: req.t(
      "pages.contactUsFurtherInformation.idCheckApp.section1.photoProblem"
    ),
    face_scanning_problem: req.t(
      "pages.contactUsFurtherInformation.idCheckApp.section1.faceScanningProblem"
    ),
    id_check_app_technical_problem: req.t(
      "pages.contactUsFurtherInformation.idCheckApp.section1.technicalError"
    ),
    id_check_app_something_else: req.t(
      "pages.contactUsFurtherInformation.idCheckApp.section1.somethingElse"
    ),
  };

  const themeQuestion = themesToQuestions[theme];
  let subthemeQuestion;
  if (subtheme) {
    if (theme == ZENDESK_THEMES.ACCOUNT_CREATION) {
      subthemeQuestion = accountCreationSubthemeToQuestions[subtheme];
    }
    if (theme == ZENDESK_THEMES.SIGNING_IN) {
      subthemeQuestion = signinSubthemeToQuestions[subtheme];
    }
    if (theme == ZENDESK_THEMES.ID_CHECK_APP) {
      subthemeQuestion = idCheckAppSubthemeToQuestions[subtheme];
    }
  }
  return {
    themeQuestion,
    subthemeQuestion,
  };
}
