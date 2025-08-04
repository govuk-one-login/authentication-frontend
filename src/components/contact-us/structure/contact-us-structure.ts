import { CONTACT_US_THEMES } from "../../../app.constants.js";
import { showWalletContactForm } from "../../../config.js";

export type ContactFormStructure = Map<string, Theme>;

export interface Theme {
  nextPageContent: string;
  radio: {
    mainTextKey: string;
    hintTextKey?: string;
  };
  subThemes?: ContactFormStructure;
  isHidden?: boolean;
}

export const CONTACT_FORM_STRUCTURE: ContactFormStructure = new Map([
  [
    CONTACT_US_THEMES.ACCOUNT_CREATION,
    {
      nextPageContent: "pages.contactUsFurtherInformation.accountCreation",
      radio: {
        mainTextKey: "pages.contactUsPublic.section3.accountCreation",
      },
      subThemes: new Map([
        [
          CONTACT_US_THEMES.NO_SECURITY_CODE,
          {
            nextPageContent: "pages.contactUsQuestions.noSecurityCode",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.accountCreation.section1.radio1",
            },
          },
        ],
        [
          CONTACT_US_THEMES.INVALID_SECURITY_CODE,
          {
            nextPageContent: "pages.contactUsQuestions.invalidSecurityCode",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.accountCreation.section1.radio2",
            },
          },
        ],
        [
          CONTACT_US_THEMES.SIGN_IN_PHONE_NUMBER_ISSUE,
          {
            nextPageContent: "pages.contactUsQuestions.signInPhoneNumberIssue",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.accountCreation.section1.radio3",
            },
          },
        ],
        [
          CONTACT_US_THEMES.AUTHENTICATOR_APP_PROBLEM,
          {
            nextPageContent: "pages.contactUsQuestions.authenticatorApp",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.accountCreation.section1.radio6",
            },
          },
        ],
        [
          CONTACT_US_THEMES.TECHNICAL_ERROR,
          {
            nextPageContent: "pages.contactUsQuestions.technicalError",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.accountCreation.section1.radio4",
            },
          },
        ],
        [
          CONTACT_US_THEMES.SOMETHING_ELSE,
          {
            nextPageContent: "pages.contactUsQuestions.accountCreationProblem",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.accountCreation.section1.radio5",
            },
          },
        ],
      ]),
    },
  ],
  [
    CONTACT_US_THEMES.SIGNING_IN,
    {
      nextPageContent: "pages.contactUsFurtherInformation.signingIn",
      radio: {
        mainTextKey: "pages.contactUsPublic.section3.signingIn",
      },
      subThemes: new Map([
        [
          CONTACT_US_THEMES.NO_SECURITY_CODE,
          {
            nextPageContent: "pages.contactUsQuestions.noSecurityCode",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.signingIn.section1.radio1",
            },
          },
        ],
        [
          CONTACT_US_THEMES.INVALID_SECURITY_CODE,
          {
            nextPageContent: "pages.contactUsQuestions.invalidSecurityCode",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.signingIn.section1.radio2",
            },
          },
        ],
        [
          CONTACT_US_THEMES.FORGOTTEN_PASSWORD,
          {
            nextPageContent: "pages.contactUsQuestions.forgottenPassword",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.signingIn.section1.radio4",
            },
          },
        ],
        [
          CONTACT_US_THEMES.LOST_SECURITY_CODE_ACCESS,
          {
            nextPageContent: "pages.contactUsQuestions.noPhoneNumberAccess",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.signingIn.section1.radio3MfaReset",
              hintTextKey:
                "pages.contactUsFurtherInformation.signingIn.section1.radio3MfaResetHint",
            },
          },
        ],
        [
          CONTACT_US_THEMES.ACCOUNT_NOT_FOUND,
          {
            nextPageContent: "pages.contactUsQuestions.accountNotFound",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.signingIn.section1.radio5",
            },
          },
        ],
        [
          CONTACT_US_THEMES.TECHNICAL_ERROR,
          {
            nextPageContent: "pages.contactUsQuestions.technicalError",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.signingIn.section1.radio6",
            },
          },
        ],
        [
          CONTACT_US_THEMES.SOMETHING_ELSE,
          {
            nextPageContent: "pages.contactUsQuestions.signignInProblem",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.signingIn.section1.radio7",
            },
          },
        ],
      ]),
    },
  ],
  [
    CONTACT_US_THEMES.ID_CHECK_APP,
    {
      nextPageContent: "pages.contactUsFurtherInformation.govUKLoginAndIdApps",
      radio: {
        mainTextKey: "pages.contactUsPublic.section3.govUKLoginAndIdApps",
      },
      subThemes: new Map([
        [
          CONTACT_US_THEMES.ID_CHECK_APP_LINKING_PROBLEM,
          {
            nextPageContent:
              "pages.contactUsQuestions.idCheckAppLinkingProblem",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.idCheckAppLinkingProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.ONE_LOGIN_APP_SIGN_IN_PROBLEM,
          {
            nextPageContent:
              "pages.contactUsQuestions.oneLoginAppSignInProblem",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.oneLoginAppSignInProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.TAKING_PHOTO_OF_ID_PROBLEM,
          {
            nextPageContent: "pages.contactUsQuestions.takingPhotoOfIdProblem",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.photoProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.FACE_SCANNING_PROBLEM,
          {
            nextPageContent: "pages.contactUsQuestions.faceScanningProblem",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.faceScanningProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_TECHNICAL_ERROR,
          {
            nextPageContent:
              "pages.contactUsQuestions.govUKLoginAndIdAppsTechnicalProblem",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.technicalError",
            },
          },
        ],
        [
          CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_SOMETHING_ELSE,
          {
            nextPageContent:
              "pages.contactUsQuestions.govUKLoginAndIdAppsSomethingElse",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.somethingElse",
            },
          },
        ],
      ]),
    },
  ],
  [
    CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE,
    {
      nextPageContent:
        "pages.contactUsFurtherInformation.provingIdentityFaceToFace",
      radio: {
        mainTextKey: "pages.contactUsPublic.section3.provingIdentityFaceToFace",
      },
      subThemes: new Map([
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_ENTERING_DETAILS,
          {
            nextPageContent:
              "pages.contactUsQuestions.provingIdentityFaceToFaceDetails",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemEnteringDetails",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_LETTER,
          {
            nextPageContent:
              "pages.contactUsQuestions.provingIdentityFaceToFaceLetter",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemPostOfficeLetter",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_AT_POST_OFFICE,
          {
            nextPageContent:
              "pages.contactUsQuestions.provingIdentityFaceToFacePostOffice",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemAtPostOffice",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_FINDING_RESULT,
          {
            nextPageContent:
              "pages.contactUsQuestions.provingIdentityFaceToFaceIdResults",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemFindingResult",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_CONTINUING,
          {
            nextPageContent:
              "pages.contactUsQuestions.provingIdentityFaceToFaceService",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemContinuing",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_TECHNICAL_PROBLEM,
          {
            nextPageContent:
              "pages.contactUsQuestions.provingIdentityFaceToFaceTechnicalProblem",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.technicalProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_ANOTHER_PROBLEM,
          {
            nextPageContent:
              "pages.contactUsQuestions.provingIdentityFaceToFaceSomethingElse",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.anotherProblem",
            },
          },
        ],
      ]),
    },
  ],
  [
    CONTACT_US_THEMES.PROVING_IDENTITY,
    {
      nextPageContent: "pages.contactUsFurtherInformation.provingIdentity",
      radio: {
        mainTextKey: "pages.contactUsPublic.section3.provingIdentity",
      },
      subThemes: new Map([
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_ANSWERING_SECURITY_QUESTIONS,
          {
            nextPageContent:
              "pages.contactUsQuestions.provingIdentityProblemAnsweringSecurityQuestions",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.provingIdentity.section1.answeringSecurityProblems",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_IDENTITY_DOCUMENT,
          {
            nextPageContent:
              "pages.contactUsQuestions.provingIdentityProblemWithIdentityDocument",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.provingIdentity.section1.problemWithPhotoId",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_BANK_BUILDING_SOCIETY_DETAILS,
          {
            nextPageContent:
              "pages.contactUsQuestions.provingIdentityProblemWithBankBuildingSocietyDetails",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.provingIdentity.section1.problemWithBankOrBuildingSociety",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_NATIONAL_INSURANCE_NUMBER,
          {
            nextPageContent:
              "pages.contactUsQuestions.provingIdentityProblemWithNationalInsuranceNumber",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.provingIdentity.section1.problemWithNINumber.label",
              hintTextKey:
                "pages.contactUsFurtherInformation.provingIdentity.section1.problemWithNINumber.hint",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_NEED_TO_UPDATE_PERSONAL_INFORMATION,
          {
            nextPageContent:
              "pages.contactUsQuestions.provingIdentityNeedToUpdatePersonalInformation",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.provingIdentity.section1.problemUpdatingPersonalInformation",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_ADDRESS,
          {
            nextPageContent:
              "pages.contactUsQuestions.provingIdentityProblemEnteringAddress",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.provingIdentity.section1.problemEnteringAddress",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_TECHNICAL_PROBLEM,
          {
            nextPageContent: "pages.contactUsQuestions.technicalError",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.provingIdentity.section1.technicalProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_SOMETHING_ELSE,
          {
            nextPageContent:
              "pages.contactUsQuestions.provingIdentitySomethingElse",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.provingIdentity.section1.somethingElse",
            },
          },
        ],
      ]),
    },
  ],
  [
    CONTACT_US_THEMES.WALLET,
    {
      nextPageContent: "pages.contactUsFurtherInformation.wallet",
      isHidden: !showWalletContactForm(),
      radio: {
        mainTextKey: "pages.contactUsPublic.section3.wallet",
      },
      subThemes: new Map([
        [
          CONTACT_US_THEMES.WALLET_PROBLEM_OPENING_APP,
          {
            nextPageContent: "pages.contactUsQuestions.walletProblemOpeningApp",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.wallet.section1.radio1",
            },
          },
        ],
        [
          CONTACT_US_THEMES.WALLET_PROBLEM_ADDING_CREDENTIALS_DOCUMENT,
          {
            nextPageContent:
              "pages.contactUsQuestions.walletProblemAddingCredentialsDocument",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.wallet.section1.radio2",
            },
          },
        ],
        [
          CONTACT_US_THEMES.WALLET_PROBLEM_VIEWING_CREDENTIALS_DOCUMENT,
          {
            nextPageContent:
              "pages.contactUsQuestions.walletProblemViewingCredentialsDocument",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.wallet.section1.radio3",
            },
          },
        ],
        [
          CONTACT_US_THEMES.WALLET_TECHNICAL_PROBLEM,
          {
            nextPageContent: "pages.contactUsQuestions.walletTechnicalProblem",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.wallet.section1.radio4",
            },
          },
        ],
        [
          CONTACT_US_THEMES.WALLET_SOMETHING_ELSE,
          {
            nextPageContent: "pages.contactUsQuestions.walletSomethingElse",
            radio: {
              mainTextKey:
                "pages.contactUsFurtherInformation.wallet.section1.radio5",
            },
          },
        ],
      ]),
    },
  ],
  [
    CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS,
    {
      nextPageContent: "pages.contactUsQuestions.suspectUnauthorisedAccess",
      radio: {
        mainTextKey: "pages.contactUsPublic.section3.suspectUnauthorisedAccess",
      },
    },
  ],
  [
    CONTACT_US_THEMES.SOMETHING_ELSE,
    {
      nextPageContent: "pages.contactUsQuestions.anotherProblem",
      radio: {
        mainTextKey: "pages.contactUsPublic.section3.somethingElse",
      },
    },
  ],
  [
    CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK,
    {
      nextPageContent: "pages.contactUsQuestions.suggestionOrFeedback",
      radio: {
        mainTextKey: "pages.contactUsPublic.section3.suggestionsFeedback",
      },
    },
  ],
]);
