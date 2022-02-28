import { Request, Response } from "express";
import { PATH_NAMES, SUPPORT_TYPE, ZENDESK_THEMES } from "../../app.constants";
import { contactUsService } from "./contact-us-service";
import { ContactUsServiceInterface, Questions, ThemeQuestions } from "./types";
import { ExpressRouteFunc } from "../../types";

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
};

const somethingElseSubThemeToPageTitle = {
  [ZENDESK_THEMES.ACCOUNT_CREATION]:
    "pages.contactUsQuestions.accountCreation.title",
  [ZENDESK_THEMES.SIGNING_IN]: "pages.contactUsQuestions.signingIn.title",
};

export function contactUsGet(req: Request, res: Response): void {
  if (req.query.supportType === SUPPORT_TYPE.GOV_SERVICE) {
    return res.render("contact-us/index-gov-service-contact-us.njk");
  }
  let fromPage = req.headers.referer;

  if (req.headers.referer && req.headers.referer.includes("fromPage")) {
    const urlObj = new URL(req.headers.referer);
    fromPage = urlObj.searchParams.get("fromPage");
  }

  return res.render("contact-us/index-public-contact-us.njk", {
    fromPage: fromPage,
  });
}

export function contactUsFormPost(req: Request, res: Response): void {
  let url = PATH_NAMES.CONTACT_US_QUESTIONS;
  const queryParams = new URLSearchParams({
    theme: req.body.theme,
    fromPage: req.body.fromPage,
  }).toString();
  if (
    [ZENDESK_THEMES.ACCOUNT_CREATION, ZENDESK_THEMES.SIGNING_IN].includes(
      req.body.theme
    )
  ) {
    url = PATH_NAMES.CONTACT_US_FURTHER_INFORMATION;
  }
  res.redirect(url + "?" + queryParams);
}

export function furtherInformationGet(req: Request, res: Response): void {
  if (!req.query.theme) {
    return res.redirect(PATH_NAMES.CONTACT_US);
  }
  return res.render("contact-us/further-information/index.njk", {
    theme: req.query.theme,
    fromPage: req.query.fromPage,
  });
}

export function furtherInformationPost(req: Request, res: Response): void {
  const url = PATH_NAMES.CONTACT_US_QUESTIONS;
  const queryParams = new URLSearchParams({
    theme: req.body.theme,
    subtheme: req.body.subtheme,
    fromPage: req.body.fromPage,
  }).toString();

  res.redirect(url + "?" + queryParams);
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
    backurl: req.headers.referer,
    fromPage: req.query.fromPage,
    pageTitleHeading: pageTitle,
  });
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

    await service.contactUsSubmitForm({
      descriptions: {
        issueDescription: req.body.issueDescription,
        additionalDescription: req.body.additionalDescription,
        optionalDescription: req.body.optionalDescription,
      },
      themes: { theme: req.body.theme, subtheme: req.body.subtheme },
      subject: "GOV.UK Accounts Feedback",
      email: req.body.email,
      name: req.body.name,
      optionalData: {
        sessionId: res.locals.sessionId,
        userAgent: req.get("User-Agent"),
      },
      feedbackContact: req.body.contact === "true",
      questions: questions,
      themeQuestions: themeQuestions,
      referer: req.body.fromPage,
    });

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
      optionalDescription: req.t(
        "pages.contactUsQuestions.invalidSecurityCode.section1.header"
      ),
    },
    noPhoneNumberAccess: {
      optionalDescription: req.t(
        "pages.contactUsQuestions.noPhoneNumberAccess.section1.header"
      ),
    },
    noSecurityCode: {
      optionalDescription: req.t(
        "pages.contactUsQuestions.noSecurityCode.section1.header"
      ),
    },
    noUKMobile: {
      optionalDescription: req.t(
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
  };

  return formTypeToQuestions[formType];
}

export function getQuestionFromThemes(
  req: Request,
  theme: string,
  subtheme?: string
): ThemeQuestions {
  const themesToQuestions: { [key: string]: any } = {
    account_creation: req.t("pages.contactUsPublic.section3.radio1"),
    signing_in: req.t("pages.contactUsPublic.section3.radio2"),
    something_else: req.t("pages.contactUsPublic.section3.radio3"),
    email_subscriptions: req.t("pages.contactUsPublic.section3.radio4"),
    suggestions_feedback: req.t("pages.contactUsPublic.section3.radio5"),
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
  }
  return {
    themeQuestion,
    subthemeQuestion,
  };
}
