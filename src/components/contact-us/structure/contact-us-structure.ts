import { CONTACT_US_THEMES } from "../../../app.constants.js";

export type ContactFormStructure = Map<string, Theme>;

export interface Theme {
  nextPageHeading: string;
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
      nextPageHeading: "pages.contactUsFurtherInformation.accountCreation.header",
      radio: {
        mainText: "pages.contactUsPublic.section3.accountCreation",
      },
      subThemes: new Map([
        [
          CONTACT_US_THEMES.NO_SECURITY_CODE,
          {
            nextPageHeading: "pages.contactUsQuestions.noSecurityCode.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.accountCreation.section1.radio1",
            },
          },
        ],
        [
          CONTACT_US_THEMES.INVALID_SECURITY_CODE,
          {
            nextPageHeading: "pages.contactUsQuestions.invalidSecurityCode.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.accountCreation.section1.radio2",
            },
          },
        ],
        [
          CONTACT_US_THEMES.SIGN_IN_PHONE_NUMBER_ISSUE,
          {
            nextPageHeading: "pages.contactUsQuestions.signInPhoneNumberIssue.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.accountCreation.section1.radio3",
            },
          },
        ],
        [
          CONTACT_US_THEMES.AUTHENTICATOR_APP_PROBLEM,
          {
            nextPageHeading: "pages.contactUsQuestions.authenticatorApp.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.accountCreation.section1.radio6",
            },
          },
        ],
        [
          CONTACT_US_THEMES.TECHNICAL_ERROR,
          {
            nextPageHeading: "pages.contactUsQuestions.technicalError.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.accountCreation.section1.radio4",
            },
          },
        ],
        [
          CONTACT_US_THEMES.SOMETHING_ELSE,
          {
            nextPageHeading: "pages.contactUsQuestions.accountCreationProblem.header",
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
      nextPageHeading: "pages.contactUsFurtherInformation.signingIn.header",
      radio: {
        mainText: "pages.contactUsPublic.section3.signingIn",
      },
      subThemes: new Map([
        [
          CONTACT_US_THEMES.NO_SECURITY_CODE,
          {
            nextPageHeading: "pages.contactUsQuestions.noSecurityCode.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.signingIn.section1.radio1",
            },
          },
        ],
        [
          CONTACT_US_THEMES.INVALID_SECURITY_CODE,
          {
            nextPageHeading: "pages.contactUsQuestions.invalidSecurityCode.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.signingIn.section1.radio2",
            },
          },
        ],
        [
          CONTACT_US_THEMES.FORGOTTEN_PASSWORD,
          {
            nextPageHeading: "pages.contactUsQuestions.forgottenPassword.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.signingIn.section1.radio4",
            },
          },
        ],
        [
          CONTACT_US_THEMES.LOST_SECURITY_CODE_ACCESS,
          {
            nextPageHeading: "pages.contactUsQuestions.noPhoneNumberAccess.header",
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
            nextPageHeading: "pages.contactUsQuestions.accountNotFound.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.signingIn.section1.radio5",
            },
          },
        ],
        [
          CONTACT_US_THEMES.TECHNICAL_ERROR,
          {
            nextPageHeading: "pages.contactUsQuestions.technicalError.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.signingIn.section1.radio6",
            },
          },
        ],
        [
          CONTACT_US_THEMES.SOMETHING_ELSE,
          {
            nextPageHeading: "pages.contactUsQuestions.signignInProblem.header",
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
      nextPageHeading: "pages.contactUsFurtherInformation.idCheckApp.header",
      radio: {
        mainText: "pages.contactUsPublic.section3.govUKLoginAndIdApps",
      },
      subThemes: new Map([
        [
          CONTACT_US_THEMES.ID_CHECK_APP_LINKING_PROBLEM,
          {
            nextPageHeading: "pages.contactUsQuestions.idCheckAppLinkingProblem.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.idCheckAppLinkingProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.ONE_LOGIN_APP_SIGN_IN_PROBLEM,
          {
            nextPageHeading: "pages.contactUsQuestions.oneLoginAppSignInProblem.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.oneLoginAppSignInProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.TAKING_PHOTO_OF_ID_PROBLEM,
          {
            nextPageHeading: "pages.contactUsQuestions.takingPhotoOfIdProblem.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.photoProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.FACE_SCANNING_PROBLEM,
          {
            nextPageHeading: "pages.contactUsQuestions.faceScanningProblem.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.faceScanningProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_TECHNICAL_ERROR,
          {
            nextPageHeading: "pages.contactUsQuestions.govUKLoginAndIdAppsTechnicalProblem.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.technicalError",
            },
          },
        ],
        [
          CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_SOMETHING_ELSE,
          {
            nextPageHeading: "pages.contactUsQuestions.govUKLoginAndIdAppsSomethingElse.header",
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
      nextPageHeading: "pages.contactUsFurtherInformation.provingIdentityFaceToFace.header",
      radio: {
        mainText: "pages.contactUsPublic.section3.provingIdentityFaceToFace",
      },
      subThemes: new Map([
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_ENTERING_DETAILS,
          {
            nextPageHeading: "pages.contactUsQuestions.provingIdentityFaceToFaceDetails.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemEnteringDetails",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_LETTER,
          {
            nextPageHeading: "pages.contactUsQuestions.provingIdentityFaceToFaceLetter.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemPostOfficeLetter",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_AT_POST_OFFICE,
          {
            nextPageHeading: "pages.contactUsQuestions.provingIdentityFaceToFacePostOffice.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemAtPostOffice",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_FINDING_RESULT,
          {
            nextPageHeading: "pages.contactUsQuestions.provingIdentityFaceToFaceIdResults.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemFindingResult",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_CONTINUING,
          {
            nextPageHeading: "pages.contactUsQuestions.provingIdentityFaceToFaceService.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.problemContinuing",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_TECHNICAL_PROBLEM,
          {
            nextPageHeading: "pages.contactUsQuestions.provingIdentityFaceToFaceTechnicalProblem.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.technicalProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_ANOTHER_PROBLEM,
          {
            nextPageHeading: "pages.contactUsQuestions.provingIdentityFaceToFaceSomethingElse.header",
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
      nextPageHeading: "pages.contactUsFurtherInformation.provingIdentity.header",
      radio: {
        mainText: "pages.contactUsPublic.section3.provingIdentity",
      },
      subThemes: new Map([
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_ANSWERING_SECURITY_QUESTIONS,
          {
            nextPageHeading: "pages.contactUsQuestions.provingIdentityProblemAnsweringSecurityQuestions.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentity.section1.answeringSecurityProblems",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_IDENTITY_DOCUMENT,
          {
            nextPageHeading: "pages.contactUsQuestions.provingIdentityProblemWithIdentityDocument.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentity.section1.problemWithPhotoId",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_BANK_BUILDING_SOCIETY_DETAILS,
          {
            nextPageHeading: "pages.contactUsQuestions.provingIdentityProblemWithBankBuildingSocietyDetails.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentity.section1.problemWithBankOrBuildingSociety",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_NATIONAL_INSURANCE_NUMBER,
          {
            nextPageHeading: "pages.contactUsQuestions.provingIdentityProblemWithNationalInsuranceNumber.header",
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
            nextPageHeading: "pages.contactUsQuestions.provingIdentityNeedToUpdatePersonalInformation.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentity.section1.problemUpdatingPersonalInformation",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_ADDRESS,
          {
            nextPageHeading: "pages.contactUsQuestions.provingIdentityProblemEnteringAddress.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentity.section1.problemEnteringAddress",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_TECHNICAL_PROBLEM,
          {
            nextPageHeading: "pages.contactUsQuestions.technicalError.header",
            radio: {
              mainText:
                "pages.contactUsFurtherInformation.provingIdentity.section1.technicalProblem",
            },
          },
        ],
        [
          CONTACT_US_THEMES.PROVING_IDENTITY_SOMETHING_ELSE,
          {
            nextPageHeading: "pages.contactUsQuestions.provingIdentitySomethingElse.header",
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
      nextPageHeading: "pages.contactUsQuestions.suspectUnauthorisedAccess.header",
      radio: {
        mainText: "pages.contactUsPublic.section3.suspectUnauthorisedAccess",
      },
    },
  ],
  [
    CONTACT_US_THEMES.SOMETHING_ELSE,
    {
      nextPageHeading: "pages.contactUsQuestions.anotherProblem.header",
      radio: {
        mainText: "pages.contactUsPublic.section3.somethingElse",
      },
    },
  ],
  [
    CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK,
    {
      nextPageHeading: "pages.contactUsQuestions.suggestionOrFeedback.header",
      radio: {
        mainText: "pages.contactUsPublic.section3.suggestionsFeedback",
      },
    },
  ],
]);
