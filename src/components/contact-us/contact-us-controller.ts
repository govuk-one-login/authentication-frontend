import type { Request, Response } from "express";
import {
  PATH_NAMES,
  CONTACT_US_THEMES,
  CONTACT_US_FIELD_MAX_LENGTH,
  CONTACT_US_COUNTRY_MAX_LENGTH,
  CONTACT_US_REFERER_ALLOWLIST,
} from "../../app.constants.js";
import type {
  FurtherInformationTemplateOptions,
  Questions,
  ThemeQuestions,
} from "./types.js";
import type { ExpressRouteFunc } from "../../types.js";
import crypto from "crypto";
import { logger } from "../../utils/logger.js";
import { getServiceDomain, getSupportLinkUrl } from "../../config.js";
import { getContactUsService } from "./contact-us-service.js";
import { supportTypeIsGovService } from "../../utils/request.js";
import {
  getHeaderKeyFromTheme,
  getLegendKeyFromTheme,
  getThemeRadioButtonsFromStructure,
  getTitleKeyFromTheme,
} from "./structure/contact-us-structure-utils.js";
import { CONTACT_FORM_STRUCTURE } from "./structure/contact-us-structure.js";
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
  [CONTACT_US_THEMES.LOST_SECURITY_CODE_ACCESS]:
    "pages.contactUsQuestions.noPhoneNumberAccess.titleMfaReset",
  [CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS]:
    "pages.contactUsQuestions.suspectUnauthorisedAccess.title",
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
  [CONTACT_US_THEMES.ID_CHECK_APP_LINKING_PROBLEM]:
    "pages.contactUsQuestions.idCheckAppLinkingProblem.title",
  [CONTACT_US_THEMES.ONE_LOGIN_APP_SIGN_IN_PROBLEM]:
    "pages.contactUsQuestions.oneLoginAppSignInProblem.title",
  [CONTACT_US_THEMES.TAKING_PHOTO_OF_ID_PROBLEM]:
    "pages.contactUsQuestions.takingPhotoOfIdProblem.title",
  [CONTACT_US_THEMES.FACE_SCANNING_PROBLEM]:
    "pages.contactUsQuestions.faceScanningProblem.title",
  [CONTACT_US_THEMES.ID_CHECK_APP_TECHNICAL_ERROR]:
    "pages.contactUsQuestions.idCheckAppTechnicalProblem.title",
  [CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_TECHNICAL_ERROR]:
    "pages.contactUsQuestions.govUKLoginAndIdAppsTechnicalProblem.title",
  [CONTACT_US_THEMES.ID_CHECK_APP_SOMETHING_ELSE]:
    "pages.contactUsQuestions.idCheckAppSomethingElse.title",
  [CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_SOMETHING_ELSE]:
    "pages.contactUsQuestions.govUKLoginAndIdAppsSomethingElse.title",
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
  [CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_BANK_BUILDING_SOCIETY_DETAILS]:
    "pages.contactUsQuestions.provingIdentityProblemWithBankBuildingSocietyDetails.title",
  [CONTACT_US_THEMES.PROVING_IDENTITY_NEED_TO_UPDATE_PERSONAL_INFORMATION]:
    "pages.contactUsQuestions.provingIdentityNeedToUpdatePersonalInformation.title",
  [CONTACT_US_THEMES.PROVING_IDENTITY_SOMETHING_ELSE]:
    "pages.contactUsQuestions.provingIdentitySomethingElse.title",
  [CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_NATIONAL_INSURANCE_NUMBER]:
    "pages.contactUsQuestions.provingIdentityProblemWithNationalInsuranceNumber.title",
  [CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_ADDRESS]:
    "pages.contactUsQuestions.provingIdentityProblemEnteringAddress.title",
  [CONTACT_US_THEMES.WALLET_PROBLEM_OPENING_APP]:
    "pages.contactUsQuestions.walletProblemOpeningApp.title",
  [CONTACT_US_THEMES.WALLET_PROBLEM_ADDING_CREDENTIALS_DOCUMENT]:
    "pages.contactUsQuestions.walletProblemAddingCredentialsDocument.title",
  [CONTACT_US_THEMES.WALLET_PROBLEM_VIEWING_CREDENTIALS_DOCUMENT]:
    "pages.contactUsQuestions.walletProblemViewingCredentialsDocument.title",
  [CONTACT_US_THEMES.WALLET_TECHNICAL_PROBLEM]:
    "pages.contactUsQuestions.walletTechnicalProblem.title",
  [CONTACT_US_THEMES.WALLET_SOMETHING_ELSE]:
    "pages.contactUsQuestions.walletSomethingElse.title",
};

const somethingElseSubThemeToPageTitle = {
  [CONTACT_US_THEMES.ACCOUNT_CREATION]:
    "pages.contactUsQuestions.accountCreation.title",
  [CONTACT_US_THEMES.SIGNING_IN]: "pages.contactUsQuestions.signingIn.title",
  [CONTACT_US_THEMES.ID_CHECK_APP_TECHNICAL_ERROR]:
    "pages.contactUsQuestions.idCheckAppTechnicalProblem.title",
  [CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_TECHNICAL_ERROR]:
    "pages.contactUsQuestions.govUKLoginAndIdAppsTechnicalProblem.title",
  [CONTACT_US_THEMES.ID_CHECK_APP_SOMETHING_ELSE]:
    "pages.contactUsQuestions.idCheckAppSomethingElse.title",
  [CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_SOMETHING_ELSE]:
    "pages.contactUsQuestions.govUKLoginAndIdAppsSomethingElse.title",
};

const ga4DataSetterContactUsQuestions: {
  [key: string]: { contentId: string };
} = {
  [CONTACT_US_THEMES.ACCOUNT_CREATION +
  CONTACT_US_THEMES.AUTHENTICATOR_APP_PROBLEM]: {
    contentId: "f5973d04-5640-49cd-bed6-c5852fff1b18",
  },
  [CONTACT_US_THEMES.ACCOUNT_CREATION +
  CONTACT_US_THEMES.INVALID_SECURITY_CODE]: {
    contentId: "beed95d6-1d1e-4978-a15b-bc752dd766e0",
  },
  [CONTACT_US_THEMES.ACCOUNT_CREATION + CONTACT_US_THEMES.NO_SECURITY_CODE]: {
    contentId: "b0a60d6c-a51a-49bf-9812-22a4632f7f12",
  },
  [CONTACT_US_THEMES.ACCOUNT_CREATION +
  CONTACT_US_THEMES.SIGN_IN_PHONE_NUMBER_ISSUE]: {
    contentId: "0924b974-c563-40c1-a43d-961f9c611344",
  },
  [CONTACT_US_THEMES.ACCOUNT_CREATION + CONTACT_US_THEMES.TECHNICAL_ERROR]: {
    contentId: "24627703-f3c2-45fc-8cf9-ad7d5bdf8b8a",
  },
  [CONTACT_US_THEMES.ACCOUNT_CREATION + CONTACT_US_THEMES.SOMETHING_ELSE]: {
    contentId: "ca2dac32-8fb1-46de-a63a-76a43d4ae029",
  },
  [CONTACT_US_THEMES.ID_CHECK_APP + CONTACT_US_THEMES.FACE_SCANNING_PROBLEM]: {
    contentId: "4d924347-e67c-408e-9883-4261a8165589",
  },
  [CONTACT_US_THEMES.ID_CHECK_APP +
  CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_SOMETHING_ELSE]: {
    contentId: "05c2110f-76b6-463c-bfa0-7853845506cd",
  },
  [CONTACT_US_THEMES.ID_CHECK_APP +
  CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_TECHNICAL_ERROR]: {
    contentId: "d637f34b-3d66-42bb-a3a6-9c8f421eca3b",
  },
  [CONTACT_US_THEMES.ID_CHECK_APP +
  CONTACT_US_THEMES.ONE_LOGIN_APP_SIGN_IN_PROBLEM]: {
    contentId: "27f9d373-07c4-4e11-933c-0d9d424a3644",
  },
  [CONTACT_US_THEMES.ID_CHECK_APP +
  CONTACT_US_THEMES.TAKING_PHOTO_OF_ID_PROBLEM]: {
    contentId: "d4e91f93-2252-4728-a9f9-e7767e551118",
  },
  [CONTACT_US_THEMES.ID_CHECK_APP +
  CONTACT_US_THEMES.ID_CHECK_APP_LINKING_PROBLEM]: {
    contentId: "8c037523-b80c-4e06-8c7f-8fdbfdd8d3be",
  },
  [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE +
  CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_ENTERING_DETAILS]: {
    contentId: "2f61a08f-b6fe-4fc8-9856-2170355be5ef",
  },
  [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE +
  CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_LETTER]: {
    contentId: "eb12e68f-2cca-4d12-9493-0d94ab037b34",
  },
  [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE +
  CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_FINDING_RESULT]: {
    contentId: "e556eb3b-9141-41c6-8db4-b2f141279b2c",
  },
  [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE +
  CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_CONTINUING]: {
    contentId: "740fe504-6748-4aa2-a120-2181e7377a11",
  },
  [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE +
  CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_AT_POST_OFFICE]: {
    contentId: "324ec153-380c-4caa-a6f4-8a2e53b440cd",
  },
  [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE +
  CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_ANOTHER_PROBLEM]: {
    contentId: "07024f0c-e5bb-433f-a5ec-6c616244841b",
  },
  [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE +
  CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_TECHNICAL_PROBLEM]: {
    contentId: "c9ec198d-1013-4675-b6e6-efab8d2395ed",
  },
  [CONTACT_US_THEMES.PROVING_IDENTITY +
  CONTACT_US_THEMES.PROVING_IDENTITY_NEED_TO_UPDATE_PERSONAL_INFORMATION]: {
    contentId: "78176dff-8c13-48e6-822d-a48c00f79cc3",
  },
  [CONTACT_US_THEMES.PROVING_IDENTITY +
  CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_ANSWERING_SECURITY_QUESTIONS]: {
    contentId: "8084daf3-fcaf-4eee-a744-591719cf326f",
  },
  [CONTACT_US_THEMES.PROVING_IDENTITY +
  CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_BANK_BUILDING_SOCIETY_DETAILS]:
    { contentId: "08af6124-62e8-42d4-9446-a78d2477d8ef" },
  [CONTACT_US_THEMES.PROVING_IDENTITY +
  CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_IDENTITY_DOCUMENT]: {
    contentId: "f9fed43a-8319-42f0-8006-830b58971d51",
  },
  [CONTACT_US_THEMES.PROVING_IDENTITY +
  CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_NATIONAL_INSURANCE_NUMBER]: {
    contentId: "04159c21-a74c-490e-b627-30d2b9a0716c",
  },
  [CONTACT_US_THEMES.SIGNING_IN + CONTACT_US_THEMES.ACCOUNT_NOT_FOUND]: {
    contentId: "b96c1b78-1280-4562-b450-84a7739a4922",
  },
  [CONTACT_US_THEMES.SIGNING_IN + CONTACT_US_THEMES.FORGOTTEN_PASSWORD]: {
    contentId: "527d8114-684f-4d24-b1a9-c51172178f94",
  },
  [CONTACT_US_THEMES.SIGNING_IN + CONTACT_US_THEMES.INVALID_SECURITY_CODE]: {
    contentId: "da024bd1-5fb1-4f8d-8c45-cbc8f5b16f4d",
  },
  [CONTACT_US_THEMES.SIGNING_IN + CONTACT_US_THEMES.LOST_SECURITY_CODE_ACCESS]:
    { contentId: "10bd26c4-e95e-491c-8b85-b68feb30db4d" },
  [CONTACT_US_THEMES.SIGNING_IN + CONTACT_US_THEMES.NO_SECURITY_CODE]: {
    contentId: "363dd891-bd16-480c-b803-f984d5789bdc",
  },
  [CONTACT_US_THEMES.SIGNING_IN + CONTACT_US_THEMES.SOMETHING_ELSE]: {
    contentId: "cc511c78-9c54-48be-afc8-b90681d5372a",
  },
  [CONTACT_US_THEMES.SIGNING_IN + CONTACT_US_THEMES.TECHNICAL_ERROR]: {
    contentId: "6e999447-8bed-4c3d-abde-9e7c9f1c1222",
  },
  [CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK]: {
    contentId: "5c2a5db5-c4b2-44ff-8946-c35e689ba7ea",
  },
  [CONTACT_US_THEMES.WALLET + CONTACT_US_THEMES.WALLET_PROBLEM_OPENING_APP]: {
    contentId: "61badfab-0aef-42b4-a80f-946507936fae",
  },
  [CONTACT_US_THEMES.WALLET +
  CONTACT_US_THEMES.WALLET_PROBLEM_ADDING_CREDENTIALS_DOCUMENT]: {
    contentId: "566a54bf-e78b-499f-bdf4-0fffdf0c4b35",
  },
  [CONTACT_US_THEMES.WALLET +
  CONTACT_US_THEMES.WALLET_PROBLEM_VIEWING_CREDENTIALS_DOCUMENT]: {
    contentId: "fe39a122-bc00-4c48-a8d8-889a78853924",
  },
  [CONTACT_US_THEMES.WALLET + CONTACT_US_THEMES.WALLET_TECHNICAL_PROBLEM]: {
    contentId: "68c8aa90-0e32-4372-adf0-6e656936bc03",
  },
  [CONTACT_US_THEMES.WALLET + CONTACT_US_THEMES.WALLET_SOMETHING_ELSE]: {
    contentId: "c11bfca0-8c9f-49ac-ac7c-bfb871be9345",
  },
  [CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS]: {
    contentId: "730f6815-ddb8-4bfa-be22-125cf13bbac4",
  },
  [CONTACT_US_THEMES.SOMETHING_ELSE]: {
    contentId: "2d35a571-b381-41bf-9c2d-e08d7340ae6a",
  },
  [CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK]: {
    contentId: "26a56b06-19f3-4524-b9c6-526996fcb259",
  },
  [CONTACT_US_THEMES.ACCOUNT_CREATION]: {
    contentId: "a06d6387-d411-47db-8f7d-88871286330b",
  },
  [CONTACT_US_THEMES.ID_CHECK_APP]: {
    contentId: "6590475a-dd0a-47e6-a002-0a9999714c2e",
  },
  [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE]: {
    contentId: "09d74609-5e9d-46c7-b433-1f074d8d12d9",
  },
  [CONTACT_US_THEMES.SIGNING_IN]: {
    contentId: "199fa6ef-0173-411a-bb37-b19ebe08001f",
  },
  [CONTACT_US_THEMES.WALLET]: {
    contentId: "9eb24a1c-b35d-4ba0-bad4-af49089145d6",
  },
  [CONTACT_US_THEMES.PROVING_IDENTITY]: {
    contentId: "46777453-b969-4372-be6e-c309feeb5afa",
  },
};
const serviceDomain = getServiceDomain();

export function contactUsGet(req: Request, res: Response): void {
  if (supportTypeIsGovService(req)) {
    return res.render("contact-us/index-gov-service-contact-us.njk");
  }
  const REFERER = "referer";

  let referer = validateReferer(req.get(REFERER), serviceDomain);
  let fromURL;

  if (req.query.fromURL) {
    fromURL = validateReferer(req.query.fromURL as string, serviceDomain);
    req.log.info(`fromURL query param received with value ${fromURL}`);
  }

  if (req.query.referer) {
    referer = validateReferer(req.query.referer as string, serviceDomain);
    req.log.info(`referer with referer query param ${referer}`);
  }

  if (req.headers?.referer?.includes(REFERER)) {
    try {
      referer = validateReferer(
        new URL(req.get(REFERER)).searchParams.get(REFERER),
        serviceDomain
      );
      req.log.info(`referer with referer header param ${referer}`);
    } catch {
      req.log.warn(
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
    radioButtons: getThemeRadioButtonsFromStructure(CONTACT_FORM_STRUCTURE),
    ...(getAppSessionId(req.query.appSessionId as string) && {
      appSessionId: getAppSessionId(req.query.appSessionId as string),
    }),
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
  } else if (
    req.path.endsWith(PATH_NAMES.CONTACT_US_QUESTIONS) &&
    !!req.query.subtheme
  ) {
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
  if (
    [
      CONTACT_US_THEMES.ACCOUNT_CREATION,
      CONTACT_US_THEMES.SIGNING_IN,
      CONTACT_US_THEMES.ID_CHECK_APP,
      CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE,
      CONTACT_US_THEMES.PROVING_IDENTITY,
      CONTACT_US_THEMES.WALLET,
    ].includes(theme)
  ) {
    return PATH_NAMES.CONTACT_US_FURTHER_INFORMATION;
  } else {
    return PATH_NAMES.CONTACT_US_QUESTIONS;
  }
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
  const theme = req.query.theme as string;

  if (!theme) {
    return res.redirect(PATH_NAMES.CONTACT_US);
  }

  const themeStructure = CONTACT_FORM_STRUCTURE.get(theme);

  const templateOptions: FurtherInformationTemplateOptions = {
    theme,
    ...(validateReferer(req.query.fromURL as string, serviceDomain) && {
      fromURL: encodeValue(
        validateReferer(req.query.fromURL as string, serviceDomain)
      ),
    }),
    hrefBack: backLinkHref,
    referer: encodeValue(
      validateReferer(req.query.referer as string, serviceDomain)
    ),
    radioButtons: getThemeRadioButtonsFromStructure(themeStructure.subThemes),
    title: getTitleKeyFromTheme(themeStructure),
    header: getHeaderKeyFromTheme(themeStructure),
    contentId: getGA4DataVariablesContactUsQuestions(req).contentId,
    legend: getLegendKeyFromTheme(themeStructure),
  };

  if (isAppJourney(req.query.appSessionId as string)) {
    templateOptions.appSessionId = getAppSessionId(
      req.query.appSessionId as string
    );
    templateOptions.appErrorCode = getAppErrorCode(
      req.query.appErrorCode as string
    );
  }

  return res.render(
    "contact-us/further-information/index.njk",
    templateOptions
  );
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

export function generatePageTitle(req: Request): string {
  const theme = (req.query.theme || req.body.theme) as string;
  const subtheme = (req.query.subtheme || req.body.subtheme) as string;
  let pageTitle = themeToPageTitle[theme];
  if (
    subtheme === CONTACT_US_THEMES.SOMETHING_ELSE &&
    theme === CONTACT_US_THEMES.ACCOUNT_CREATION
  ) {
    pageTitle = somethingElseSubThemeToPageTitle[theme];
  } else if (subtheme) {
    pageTitle = themeToPageTitle[subtheme];
  }
  return pageTitle;
}

export function getGA4DataVariablesContactUsQuestions(req: Request): {
  contentId: string;
} {
  let theme: string;
  if (!req.query.subtheme) {
    theme = req.query.theme.toString() as string;
  } else {
    theme = (req.query.theme.toString() +
      req.query.subtheme.toString()) as string;
  }
  const contentId =
    ga4DataSetterContactUsQuestions[theme]?.contentId || "undefined";

  return {
    contentId,
  };
}

export function contactUsQuestionsGet(req: Request, res: Response): void {
  const supportLinkURL = getSupportLinkUrl();
  // TODO - AUT-4118 - Fix this
  const backLinkHref = prepareBackLink(req, supportLinkURL, serviceDomain);

  if (!req.query.theme) {
    return res.redirect(PATH_NAMES.CONTACT_US);
  }
  const pageTitle = generatePageTitle(req);
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
    pageTitle: pageTitle,
    pageTitleHeading: pageTitle,
    contentId: getGA4DataVariablesContactUsQuestions(req).contentId,
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

export enum AnsweringQuestionsAboutReason {
  FINANCIAL_INFORMATION = "financialInformation",
  PIP = "pip",
  NOT_SURE = "notSure",
}

function getReasonForAnsweringQuestionsAbout(req: Request): string | undefined {
  const reason = req.body.answeringQuestionsAbout
    ? (req.body.answeringQuestionsAbout as AnsweringQuestionsAboutReason)
    : undefined;
  if (!reason) return;

  return req.t(
    `pages.contactUsQuestions.provingIdentityProblemAnsweringSecurityQuestions.answeringQuestionsAbout.reasons.${reason}`,
    { lng: "en" }
  );
}

export function contactUsQuestionsFormPostToSmartAgent(
  service = getContactUsService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const ticketIdentifier = createTicketIdentifier(
      getAppSessionId(req.body.appSessionId)
    );

    const telephoneNumber = getTelephoneNumber(req);

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
        problemWithNationalInsuranceNumber:
          req.body.problemWithNationalInsuranceNumber,
      },
      themes: { theme: req.body.theme, subtheme: req.body.subtheme },
      subject: "GOV.UK One Login",
      email: req.body.email,
      telephoneNumber: telephoneNumber,
      name: req.body.name,
      optionalData: {
        ticketIdentifier: ticketIdentifier,
        userAgent: req.get("User-Agent"),
        appErrorCode: getAppErrorCode(req.body.appErrorCode),
        country: req.body.country,
        location: req.body.location,
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
      problemWith: req.body.problemWith,
      suspectUnauthorisedAccess:
        req.body.theme === CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS
          ? {
              hasReceivedUnwarrantedSecurityCode:
                req.body.suspectUnauthorisedAccessReasons.includes(
                  "hasReceivedUnwarrantedSecurityCode"
                ),
              hasUnknownActivityHistory:
                req.body.suspectUnauthorisedAccessReasons.includes(
                  "hasUnknownActivityHistory"
                ),
            }
          : undefined,
      answeringQuestionsAbout: getReasonForAnsweringQuestionsAbout(req),
    });

    req.log.info(
      `Support ticket submitted to SmartAgent with id ${ticketIdentifier}`
    );
    return res.redirect(PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS);
  };
}

export function contactUsSubmitSuccessGet(req: Request, res: Response): void {
  res.render("contact-us/index-submit-success.njk");
}

function getTelephoneNumber(req: Request): string | undefined {
  if (
    req.body.hasInternationalPhoneNumber === "true" &&
    req.body.internationalPhoneNumber !== ""
  ) {
    return req.body.internationalPhoneNumber;
  } else if (req.body.phoneNumber !== "") {
    return req.body.phoneNumber;
  }
}

function getQuestionsFromFormTypeForMessageBody(
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
    suspectUnauthorisedAccess: {
      hasReceivedUnwarrantedSecurityCode: req.t(
        "pages.contactUsQuestions.suspectUnauthorisedAccess.section2.options.receivedUnwarrantedSecurityCode",
        { lng: "en" }
      ),
      hasUnknownActivityHistory: req.t(
        "pages.contactUsQuestions.suspectUnauthorisedAccess.section2.options.unknownActivityHistory",
        { lng: "en" }
      ),
      email: req.t(
        "pages.contactUsQuestions.suspectUnauthorisedAccess.section3.header",
        { lng: "en" }
      ),
      phoneNumber: req.t(
        "pages.contactUsQuestions.suspectUnauthorisedAccess.section4.header",
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
    oneLoginAppSignInProblem: {
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
    govUKLoginAndIdAppsTechnicalProblem: {
      issueDescription: req.t(
        "pages.contactUsQuestions.govUKLoginAndIdAppsTechnicalProblem.section1.header",
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
    govUKLoginAndIdAppsSomethingElse: {
      issueDescription: req.t(
        "pages.contactUsQuestions.govUKLoginAndIdAppsSomethingElse.section1.header",
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
    provingIdentityProblemWithBankBuildingSocietyDetails: {
      issueDescription: req.t(
        "pages.contactUsQuestions.provingIdentityProblemWithBankBuildingSocietyDetails.section2.label",
        { lng: "en" }
      ),
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
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
    provingIdentityProblemEnteringAddress: {
      issueDescription: req.t(
        "pages.contactUsQuestions.provingIdentityProblemEnteringAddress.whatWereYouTryingToDo.label",
        { lng: "en" }
      ),
      additionalDescription: req.t(
        "pages.contactUsQuestions.whatHappened.header",
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
    provingIdentityProblemWithNationalInsuranceNumber: {
      serviceTryingToUse: req.t(
        "pages.contactUsQuestions.serviceTryingToUse.header",
        { lng: "en" }
      ),
    },
    wallet: {
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
  };

  return formTypeToQuestions[formType];
}

function getQuestionFromThemes(
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
    id_check_app: req.t("pages.contactUsPublic.section3.idCheckApp", {
      lng: "en",
    }),
    govUKLoginAndIdApps: req.t(
      "pages.contactUsPublic.section3.govUKLoginAndIdApps",
      {
        lng: "en",
      }
    ),
    id_face_to_face: req.t(
      "pages.contactUsPublic.section3.provingIdentityFaceToFace",
      {
        lng: "en",
      }
    ),
    proving_identity: req.t("pages.contactUsPublic.section3.provingIdentity", {
      lng: "en",
    }),
    suspect_unauthorised_access: req.t(
      "pages.contactUsPublic.section3.suspectUnauthorisedAccess",
      {
        lng: "en",
      }
    ),
    something_else: req.t("pages.contactUsPublic.section3.somethingElse", {
      lng: "en",
    }),
    suggestions_feedback: req.t(
      "pages.contactUsPublic.section3.suggestionsFeedback",
      { lng: "en" }
    ),
    wallet: req.t("pages.contactUsPublic.section3.wallet", {
      lng: "en",
    }),
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
    lost_security_code_access: req.t(
      "pages.contactUsFurtherInformation.signingIn.section1.radio3MfaReset",
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
    id_check_app_linking_problem: req.t(
      "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.idCheckAppLinkingProblem",
      { lng: "en" }
    ),
    one_login_app_sign_in_problem: req.t(
      "pages.contactUsFurtherInformation.idCheckApp.section1.oneLoginAppSignInProblem",
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
    gov_uk_login_and_id_apps_technical_problem: req.t(
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
    proving_identity_problem_with_bank_building_society_details: req.t(
      "pages.contactUsQuestions.provingIdentityProblemWithBankBuildingSocietyDetails.title",
      { lng: "en" }
    ),
    proving_identity_need_to_update_personal_information: req.t(
      "pages.contactUsQuestions.provingIdentityNeedToUpdatePersonalInformation.title",
      { lng: "en" }
    ),
    proving_identity_problem_with_address: req.t(
      "pages.contactUsQuestions.provingIdentityProblemEnteringAddress.title",
      { lng: "en" }
    ),
    proving_identity_something_else: req.t(
      "pages.contactUsQuestions.provingIdentitySomethingElse.title",
      { lng: "en" }
    ),
    proving_identity_problem_with_national_insurance_number: req.t(
      "pages.contactUsQuestions.provingIdentityProblemWithNationalInsuranceNumber.title",
      { lng: "en" }
    ),
  };

  const walletSubthemeToQuestions: { [key: string]: any } = {
    wallet_problem_opening_app: req.t(
      "pages.contactUsFurtherInformation.wallet.section1.radio1",
      { lng: "en" }
    ),
    wallet_problem_adding_credentials_document: req.t(
      "pages.contactUsFurtherInformation.wallet.section1.radio2",
      { lng: "en" }
    ),
    wallet_problem_viewing_credentials_document: req.t(
      "pages.contactUsFurtherInformation.wallet.section1.radio3",
      { lng: "en" }
    ),
    wallet_technical_problem: req.t(
      "pages.contactUsFurtherInformation.wallet.section1.radio4",
      { lng: "en" }
    ),
    wallet_something_else: req.t(
      "pages.contactUsFurtherInformation.wallet.section1.radio5",
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
    if (theme == CONTACT_US_THEMES.WALLET) {
      subthemeQuestion = walletSubthemeToQuestions[subtheme];
    }
  }
  return {
    themeQuestion,
    subthemeQuestion,
  };
}
