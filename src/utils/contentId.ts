import type { Request } from "express";
import type { ContentIdFunction } from "../types.js";
import { PATH_NAMES, CONTACT_US_THEMES } from "../app.constants.js";
import {
  isReauth,
  isUpliftRequired,
  isAccountRecoveryJourney,
  isAccountRecoveryJourneyAndPermitted,
  isContactUsSuggestionsFeedbackSubtheme,
  clientIsOneLogin,
  clientUsesOneLoginOptionally,
  supportTypeIsGovService,
  urlContains,
  isPasswordChangeRequired,
  needsForcedMFAReset,
} from "./request.js";
const CONTENT_IDS: {
  [path: string]: ContentIdFunction;
} = {
  [PATH_NAMES.ACCESSIBILITY_STATEMENT]: () =>
    "64775b81-6393-4ced-a281-cf84b21cc43f",
  [PATH_NAMES.ACCOUNT_LOCKED]: () => "5c0fcf31-9e5d-40b5-91ca-675e037abe07",
  [PATH_NAMES.ACCOUNT_NOT_FOUND]: (req: Request) =>
    clientIsOneLogin(req) || clientUsesOneLoginOptionally(req)
      ? "a70b71e7-b444-46e5-895c-cd2e27bbe6ba"
      : "10e1b70b-e208-4db8-8863-3679a675b51d",
  [PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES]: (req: Request) =>
    needsForcedMFAReset(req)
      ? "5a10fdaa-ddbd-4427-8697-fd8a32414a0d"
      : "d9290539-0b0c-468f-8f87-22d0400b6431",
  [PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL]: (req: Request) =>
    needsForcedMFAReset(req)
      ? "e003e6dd-7d1f-4d64-b019-d3f1423e99cf"
      : "d1b7cd24-f508-49ce-bf0d-ac1fe980c09c",
  [PATH_NAMES.CANNOT_USE_SECURITY_CODE]: () =>
    "f31eb32b-c0b3-4d94-a09d-826c8d4e28a3",
  [PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION]: () =>
    "1abedb1b-7d09-4e81-9f88-a8b4297635b3",
  [PATH_NAMES.CHANGE_SECURITY_CODES_SIGN_IN]: () =>
    "1707292e-b02b-4137-a861-bdeb5766946a",
  [PATH_NAMES.CHECK_YOUR_EMAIL]: () => "054e1ea8-97a8-461a-a964-07345c80098e",
  [PATH_NAMES.CHECK_YOUR_PHONE]: () => "1fef9388-34cd-4ea2-b899-a66b7327d2f7",
  [PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER]: (req: Request) =>
    isAccountRecoveryJourneyAndPermitted(req)
      ? "cbca1676-f632-4937-984e-1ae5934d13e2"
      : "0f519eb6-5cd4-476f-968f-d847b3c4c034",
  [PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP]: (req: Request) =>
    isAccountRecoveryJourney(req)
      ? "124051ef-673a-4eda-b585-96d9d711f545"
      : "5bc82db9-2012-44bf-9a7d-34d1d22fb035",
  [PATH_NAMES.CONTACT_US]: (req: Request) =>
    supportTypeIsGovService(req) ? "" : "e08d04e6-b24f-4bad-9955-1eb860771747",
  [PATH_NAMES.CONTACT_US_FURTHER_INFORMATION]: () =>
    "a06d6387-d411-47db-8f7d-88871286330b",
  [PATH_NAMES.CONTACT_US_QUESTIONS]: (req: Request) =>
    isContactUsSuggestionsFeedbackSubtheme(req)
      ? "94ff0276-9791-4a74-95c4-8210ec4028f7"
      : "",
  [PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS]: () =>
    "0e020971-d828-4679-97fe-23af6e96ab14",
  [PATH_NAMES.COOKIES_POLICY]: () => "e89b1325-b91c-493e-a44e-b8d2373ab81d",
  [PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD]: () =>
    "8c0cc624-2e97-471d-ad36-6b695f9a038d",
  [PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL]: () =>
    "6857e410-75b8-4807-b475-3f24fc96c9de",
  [PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE]: (req: Request) => {
    if (isReauth(req)) {
      return "6e5cc49f-4770-4089-8547-06149e0f59b1";
    }
    if (isUpliftRequired(req)) {
      return "";
    }
    return "89461417-df3f-46a8-9c37-713b9dd78085";
  },
  [PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT]: () =>
    "390f46f9-1f6b-44f2-8fd7-21a5385a7d3a",
  [PATH_NAMES.ENTER_EMAIL_SIGN_IN]: (req: Request) =>
    isReauth(req)
      ? "aff1628e-177d-4afc-825b-56e926b2fc1f"
      : "d8767bcf-ffb8-4b43-8bda-24c6291590bb",
  [PATH_NAMES.ENTER_MFA]: (req: Request) => {
    if (isReauth(req)) {
      return "c9f09429-b29d-421e-a33a-41149489a0a2";
    }
    if (isUpliftRequired(req)) {
      return "";
    }
    return "19601dd7-be55-4ab6-aa44-a6358c4239dc";
  },
  [PATH_NAMES.ERROR_PAGE]: () => "7eac284f-bdef-43ff-8c11-7d97f4d8a8f2",
  [PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES]: () =>
    "5c2256e7-a704-4da7-8cb4-0249fd8da0c4",
  [PATH_NAMES.ENTER_PASSWORD]: (req: Request) =>
    isReauth(req)
      ? "c6f4fed1-ee6d-4d23-a14f-4466e9c1349c"
      : "6b9f2243-d217-4c55-8ef3-7ac24b1f77e2",
  [PATH_NAMES.GET_SECURITY_CODES]: (req: Request) =>
    isAccountRecoveryJourney(req)
      ? "e768e27b-1c4d-48ba-8bcf-4c40274a6441"
      : "95e26313-bc2f-49bc-bc62-fd715476c1d9",
  [PATH_NAMES.PASSWORD_RESET_REQUIRED]: () => "",
  [PATH_NAMES.ENTER_PASSWORD_ACCOUNT_EXISTS]: () =>
    "a36232c7-2649-42f8-bf1e-e66ba151aa1c",
  [PATH_NAMES.PRIVACY_POLICY]: () => "d6f1e8d8-175e-4ec3-81bb-3c8aeaa63b32",
  [PATH_NAMES.PROVE_IDENTITY_CALLBACK]: () => "",
  [PATH_NAMES.PROVE_IDENTITY_CALLBACK_SESSION_EXPIRY_ERROR]: () => "",
  [PATH_NAMES.RESEND_EMAIL_CODE]: () => "3104ec55-1a4e-4811-b927-0531fb315480",
  [PATH_NAMES.RESEND_MFA_CODE]: (req: Request) =>
    isReauth(req)
      ? "a2776ef7-9ef3-4d8d-bdbc-3f798b15e5d4"
      : "f463a280-31f1-43c0-a2f5-6b46b1e2bb15",
  [PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION]: () =>
    "8247477c-3e33-4dae-9528-22e7ed44efb3",
  [PATH_NAMES.RESET_PASSWORD]: (req: Request) =>
    isPasswordChangeRequired(req)
      ? "48da381e-71a4-48bf-9580-e26fae197134"
      : "c8520c6c-9f09-4edf-8c99-7123a3991cfc",
  [PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP]: () =>
    "943b41f4-8262-417f-8866-c0639319ccf0",
  [PATH_NAMES.RESET_PASSWORD_2FA_SMS]: () =>
    "e626c94e-4454-4a63-b902-6a4e5820d7dd",
  [PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL]: (req: Request) => {
    if (urlContains(req, "csrf")) {
      return "e48886d5-7be8-424d-8471-d9a9bf49d1b7";
    }
    if (urlContains(req, "requestcode")) {
      return "8cbc57f9-28df-4279-a001-cc62a9dd3415";
    }
    return "b78d016b-0f2c-4599-9c2f-76b3a6397997";
  },
  [PATH_NAMES.RESET_PASSWORD_RESEND_CODE]: () =>
    "7b663466-8001-436f-b10b-e6ac581d39aa",
  [PATH_NAMES.SECURITY_CODE_INVALID]: () =>
    "fdbcdd69-a2d5-4aee-97f2-d65d8f307dc5",
  [PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED]: () =>
    "445409a8-2aaf-47fc-82a9-b277eca4601d",
  [PATH_NAMES.SECURITY_CODE_WAIT]: () => "1277915f-ce6e-4a06-89a0-e3458f95631a",
  [PATH_NAMES.SIGNED_OUT]: () => "83a49745-773f-49f6-aa15-58399e9a856c",
  [PATH_NAMES.SIGN_IN_OR_CREATE]: () => "9cd55996-3f12-4e79-adf3-0ec3c4faf7ce",
  [PATH_NAMES.SIGN_IN_RETRY_BLOCKED]: () =>
    "e020dd02-2f97-46f9-9b26-c98730c89d73",
  [PATH_NAMES.SUPPORT]: () => "",
  [PATH_NAMES.TERMS_AND_CONDITIONS]: () =>
    "6e991299-ede9-4b92-a177-0c07b3604c63",
  [PATH_NAMES.UNAVAILABLE_PERMANENT]: () => "",
  [PATH_NAMES.UNAVAILABLE_TEMPORARY]: () =>
    "895deac9-e21d-4991-b1f7-9509c2d8c10e",
  [PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS]: () =>
    "c45fdcf0-78fa-4f5d-be5e-7823bb4d6973",
  [PATH_NAMES.CANNOT_USE_EMAIL_ADDRESS]: () =>
    "9fd51f56-0ca9-4591-93fc-5b2896553b9f",
};

export const themeToPageTitle = {
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

export const somethingElseSubThemeToPageTitle = {
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

export const ga4DataSetterContactUsQuestions: {
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

export function getContentId(
  req: Request,
  contentIds: {
    [path: string]: ContentIdFunction;
  } = CONTENT_IDS
): string {
  const supportedPaths = Object.keys(contentIds);
  const matchedSupportedPath = supportedPaths.find((path) => req.path === path);
  const contentId = matchedSupportedPath && contentIds[matchedSupportedPath];

  if (!contentId) return "";
  return contentId(req);
}
