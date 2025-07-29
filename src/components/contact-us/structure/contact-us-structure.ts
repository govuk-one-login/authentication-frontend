import { CONTACT_US_THEMES } from "../../../app.constants.js";

export type ContactFormStructure = Map<string, Theme>;

export interface Theme {
  radio: {
    mainText: string;
    hintText?: string;
  };
  subThemes?: ContactFormStructure;
}

export const getContactFormStructure = (): ContactFormStructure =>
  CONTACT_FORM_STRUCTURE;

export const CONTACT_FORM_STRUCTURE: ContactFormStructure = new Map([
  [
    CONTACT_US_THEMES.ACCOUNT_CREATION,
    {
      radio: {
        mainText: "pages.contactUsPublic.section3.accountCreation",
      },
      subThemes: new Map([
        [
          CONTACT_US_THEMES.NO_SECURITY_CODE,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.accountCreation.section1.radio1",
            },
          },
        ],
        [
          CONTACT_US_THEMES.INVALID_SECURITY_CODE,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.accountCreation.section1.radio2",
            },
          },
        ],
        [
          CONTACT_US_THEMES.SIGN_IN_PHONE_NUMBER_ISSUE,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.accountCreation.section1.radio3",
            },
          },
        ],
        [
          CONTACT_US_THEMES.AUTHENTICATOR_APP_PROBLEM,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.accountCreation.section1.radio6",
            },
          },
        ],
        [
          CONTACT_US_THEMES.TECHNICAL_ERROR,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.accountCreation.section1.radio4",
            },
          },
        ],
        [
          CONTACT_US_THEMES.SOMETHING_ELSE,
          {
            radio: {
              mainText:
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
      radio: {
        mainText: "pages.contactUsPublic.section3.signingIn",
      },
      subThemes: new Map([
        [
          CONTACT_US_THEMES.NO_SECURITY_CODE,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.signingIn.section1.radio1",
            },
          },
        ],
        [
          CONTACT_US_THEMES.INVALID_SECURITY_CODE,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.signingIn.section1.radio2",
            },
          },
        ],
        [
          CONTACT_US_THEMES.FORGOTTEN_PASSWORD,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.signingIn.section1.radio4",
            },
          },
        ],
        [
          CONTACT_US_THEMES.LOST_SECURITY_CODE_ACCESS,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.signingIn.section1.radio3MfaReset",
              hintText:
                "pages.contactUsFurtherInformation.signingIn.section1.radio3MfaResetHint",
            },
          },
        ],
        [
          CONTACT_US_THEMES.ACCOUNT_NOT_FOUND,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.signingIn.section1.radio5",
            },
          },
        ],
        [
          CONTACT_US_THEMES.TECHNICAL_ERROR,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.signingIn.section1.radio6",
            },
          },
        ],
        [
          CONTACT_US_THEMES.SOMETHING_ELSE,
          {
            radio: {
              mainText:
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
      radio: {
        mainText: "pages.contactUsPublic.section3.govUKLoginAndIdApps",
      },
      subThemes: new Map([
        [
          CONTACT_US_THEMES.ID_CHECK_APP_LINKING_PROBLEM,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.idCheckAppLinkingProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.ONE_LOGIN_APP_SIGN_IN_PROBLEM,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.oneLoginAppSignInProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.TAKING_PHOTO_OF_ID_PROBLEM,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.photoProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.FACE_SCANNING_PROBLEM,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.faceScanningProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_TECHNICAL_ERROR,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.technicalError",
            },
          },
        ],
        [
          CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_SOMETHING_ELSE,
          {
            radio: {
              mainText:
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
      radio: {
        mainText: "pages.contactUsPublic.section3.provingIdentityFaceToFace",
      },
      subThemes: new Map([
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_ENTERING_DETAILS,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemEnteringDetails",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_LETTER,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemPostOfficeLetter",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_AT_POST_OFFICE,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemAtPostOffice",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_FINDING_RESULT,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemFindingResult",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_CONTINUING,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemContinuing",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_TECHNICAL_PROBLEM,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.technicalProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_ANOTHER_PROBLEM,
          {
            radio: {
              mainText:
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
      radio: {
        mainText: "pages.contactUsPublic.section3.provingIdentity",
      },
      subThemes: new Map([
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_ANSWERING_SECURITY_QUESTIONS,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentity.section1.answeringSecurityProblems",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_IDENTITY_DOCUMENT,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentity.section1.problemWithPhotoId",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_BANK_BUILDING_SOCIETY_DETAILS,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentity.section1.problemWithBankOrBuildingSociety",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_NATIONAL_INSURANCE_NUMBER,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentity.section1.problemWithNINumber.label",
              hintText:
                "pages.contactUsFurtherInformation.provingIdentity.section1.problemWithNINumber.hint",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_NEED_TO_UPDATE_PERSONAL_INFORMATION,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentity.section1.problemUpdatingPersonalInformation",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_ADDRESS,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentity.section1.problemEnteringAddress",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_TECHNICAL_PROBLEM,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentity.section1.technicalProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_SOMETHING_ELSE,
          {
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentity.section1.somethingElse",
            },
          },
        ],
      ]),
    },
  ],
  [
    CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS,
    {
      radio: {
        mainText: "pages.contactUsPublic.section3.suspectUnauthorisedAccess",
      },
    },
  ],
  [
    CONTACT_US_THEMES.SOMETHING_ELSE,
    {
      radio: {
        mainText: "pages.contactUsPublic.section3.somethingElse",
      },
    },
  ],
  [
    CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK,
    {
      radio: {
        mainText: "pages.contactUsPublic.section3.suggestionsFeedback",
      },
    },
  ],
]);
