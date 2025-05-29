import type { CustomSanitizer } from "express-validator";
import { body, check } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware.js";
import type { ValidationChainFunc } from "../../types.js";
import xss from "xss";
import {
  CONTACT_US_FIELD_MAX_LENGTH,
  CONTACT_US_THEMES,
  CONTACT_US_COUNTRY_MAX_LENGTH,
} from "../../app.constants.js";
import {
  internationalPhoneNumberMustBeValid,
  ukPhoneNumberMustContainLeadingPlusNumbersOrSpacesOnly,
  ukPhoneNumberMustBeValid,
  ukPhoneNumberMustHaveLengthWithoutSpacesInRange,
  internationalPhoneNumberMustContainLeadingPlusNumbersOrSpacesOnly,
  internationalPhoneNumberMustHaveLengthWithoutSpacesInRange,
} from "../common/phone-number/phone-number-validation.js";
const sanitizeFreeTextValue: CustomSanitizer = function sanitizeFreeTextValue(
  value: string
) {
  return xss(value);
};

export function validateContactUsQuestionsRequest(): ValidationChainFunc {
  return [
    body("location").custom((value, { req }) => {
      if (
        req.body.subtheme === CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_ADDRESS &&
        value === undefined
      ) {
        throw new Error(
          req.t(
            "pages.contactUsQuestions.provingIdentityProblemEnteringAddress.location.errorMessage",
            { value, lng: req.i18n.lng }
          )
        );
      }
      return true;
    }),
    body("securityCodeSentMethod")
      .if(body("theme").equals("account_creation"))
      .if(check("radio_buttons").notEmpty())
      .notEmpty()
      .withMessage((value, { req }) => {
        const suffix = req.body.theme == "signing_in" ? "SignIn" : "";
        return req.t(
          "pages.contactUsQuestions." +
            req.body.formType +
            ".section1.errorMessage" +
            suffix,
          { value, lng: req.i18n.lng }
        );
      }),
    body("identityDocumentUsed")
      .if(body("theme").equals("id_check_app"))
      .if(body("subtheme").equals("taking_photo_of_id_problem"))
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.takingPhotoOfIdProblem.identityDocument.errorMessage",
          { value, lng: req.i18n.lng }
        );
      }),
    body("identityDocumentUsed")
      .if(body("theme").equals("proving_identity"))
      .if(body("subtheme").equals("proving_identity_problem_with_identity_document"))
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.provingIdentityProblemWithIdentityDocument.identityDocument.errorMessage",
          { value, lng: req.i18n.lng }
        );
      }),
    body("problemWith")
      .if(body("theme").equals("proving_identity"))
      .if(
        body("subtheme").equals(
          "proving_identity_problem_with_bank_building_society_details"
        )
      )
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.provingIdentityProblemWithBankBuildingSocietyDetails.section1.errorMessage",
          { value, lng: req.i18n.lng }
        );
      }),
    body("issueDescription")
      .optional()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          getErrorMessageForIssueDescription(req.body.theme, req.body.subtheme),
          { value, lng: req.i18n.lng }
        );
      }),
    body("issueDescription")
      .if(body("theme").equals(CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE))
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          getErrorMessageForIssueDescription(req.body.theme, req.body.subtheme),
          { value, lng: req.i18n.lng }
        );
      }),
    body("issueDescription")
      .optional()
      .isLength({ max: CONTACT_US_FIELD_MAX_LENGTH })
      .withMessage((value, { req }) => {
        return req.t(
          getLengthExceededErrorMessageForIssueDescription(
            req.body.theme,
            req.body.subtheme
          ),
          { value, lng: req.i18n.lng }
        );
      }),
    body("additionalDescription")
      .optional()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          getErrorMessageForAdditionalDescription(req.body.theme, req.body.subtheme),
          { value, lng: req.i18n.lng }
        );
      }),
    body("additionalDescription")
      .optional()
      .isLength({ max: CONTACT_US_FIELD_MAX_LENGTH })
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.additionalDescriptionErrorMessage.entryTooLongMessage",
          { value, lng: req.i18n.lng }
        );
      }),
    body("optionalDescription")
      .optional()
      .isLength({ max: CONTACT_US_FIELD_MAX_LENGTH })
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.optionalDescriptionErrorMessage.entryTooLongMessage",
          { value, lng: req.i18n.lng }
        );
      }),
    body("moreDetailDescription")
      .optional()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.contactUsQuestions.optionalDescriptionErrorMessage.message", {
          value,
          lng: req.i18n.lng,
        });
      }),
    body("serviceTryingToUse")
      .optional()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.contactUsQuestions.serviceTryingToUse.errorMessage", {
          value,
          lng: req.i18n.lng,
        });
      }),
    body("moreDetailDescription")
      .optional()
      .isLength({ max: CONTACT_US_FIELD_MAX_LENGTH })
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.optionalDescriptionErrorMessage.entryTooLongMessage",
          { value, lng: req.i18n.lng }
        );
      }),
    body("problemWithNationalInsuranceNumber")
      .if(body("theme").equals("proving_identity"))
      .if(
        body("subtheme").equals("proving_identity_problem_with_national_insurance_number")
      )
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.provingIdentityProblemWithNationalInsuranceNumber.section1.errorMessage",
          { value, lng: req.i18n.lng }
        );
      }),
    body("problemWithNationalInsuranceNumber")
      .if(body("theme").equals("proving_identity"))
      .if(
        body("subtheme").equals("proving_identity_problem_with_national_insurance_number")
      )
      .isLength({ max: CONTACT_US_FIELD_MAX_LENGTH })
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.optionalDescriptionErrorMessage.entryTooLongMessage",
          { value, lng: req.i18n.lng }
        );
      }),
    body("location").custom((value, { req }) => {
      if (
        req.body.subtheme === CONTACT_US_THEMES.PROVING_IDENTITY_SOMETHING_ELSE &&
        value === undefined
      ) {
        throw new Error(
          req.t(
            "pages.contactUsQuestions.provingIdentityProblemEnteringAddress.location.errorMessage",
            { value, lng: req.i18n.lng }
          )
        );
      }
      return true;
    }),
    body("suspectUnauthorisedAccessReasons")
      .if(body("theme").equals(CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS))
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.suspectUnauthorisedAccess.section2.validationError.selectAtLeastOne",
          { value, lng: req.i18n.lng }
        );
      }),
    body("contact")
      .if(body("theme").not().equals(CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS))
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.replyByEmail.validationError.noBoxSelected",
          { value, lng: req.i18n.lng }
        );
      }),
    body("email")
      .if(body("theme").equals(CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS))
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.suspectUnauthorisedAccess.section3.validationError.noEmailAddress",
          { value, lng: req.i18n.lng }
        );
      })
      .isEmail()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.suspectUnauthorisedAccess.section3.validationError.invalidFormat",
          { value, lng: req.i18n.lng }
        );
      }),
    body("email")
      .if(body("theme").not().equals(CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS))
      .if(body("contact").equals("true"))
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.replyByEmail.validationError.noEmailAddress",
          { value, lng: req.i18n.lng }
        );
      })
      .isEmail()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.replyByEmail.validationError.invalidFormat",
          { value, lng: req.i18n.lng }
        );
      }),
    body("phoneNumber")
      .if(body("theme").equals(CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS))
      .if(body("phoneNumber").not().equals(""))
      .if(body("hasInternationalPhoneNumber").not().equals("true"))
      .custom(ukPhoneNumberMustContainLeadingPlusNumbersOrSpacesOnly)
      .custom(ukPhoneNumberMustHaveLengthWithoutSpacesInRange)
      .custom(ukPhoneNumberMustBeValid),
    body("internationalPhoneNumber")
      .if(body("theme").equals(CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS))
      .if(body("internationalPhoneNumber").not().equals(""))
      .if(body("hasInternationalPhoneNumber").notEmpty().equals("true"))
      .custom(internationalPhoneNumberMustContainLeadingPlusNumbersOrSpacesOnly)
      .custom(internationalPhoneNumberMustHaveLengthWithoutSpacesInRange)
      .custom(internationalPhoneNumberMustBeValid),
    body("country")
      .optional()
      .custom((value, { req }) => {
        if (req.body.securityCodeSentMethod === "text_message_international_number") {
          if (!value) {
            throw new Error(
              req.t(
                "pages.contactUsQuestions.textMessageInternationNumberConditionalSection.errorIfBlank",
                { value, lng: req.i18n.lng }
              )
            );
          }
        }
        return true;
      }),
    body("countryPhoneNumberFrom")
      .optional()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.signInPhoneNumberIssue.section3.ifBlankErrorMessage",
          { value, lng: req.i18n.lng }
        );
      }),
    body("countryPhoneNumberFrom")
      .optional()
      .isLength({ max: CONTACT_US_COUNTRY_MAX_LENGTH })
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.signInPhoneNumberIssue.section3.ifTooLongErrorMessage",
          { value, lng: req.i18n.lng }
        );
      }),
    //Free text Sanitizers
    body("serviceTryingToUse").customSanitizer(sanitizeFreeTextValue),
    body("problemWithNationalInsuranceNumber").customSanitizer(sanitizeFreeTextValue),
    body("moreDetailDescription").customSanitizer(sanitizeFreeTextValue),
    body("optionalDescription").customSanitizer(sanitizeFreeTextValue),
    body("additionalDescription").customSanitizer(sanitizeFreeTextValue),
    body("problemWith").customSanitizer(sanitizeFreeTextValue),
    body("issueDescription").customSanitizer(sanitizeFreeTextValue),
    body("name").customSanitizer(sanitizeFreeTextValue),
    body("country").customSanitizer(sanitizeFreeTextValue),
    body("countryPhoneNumberFrom").customSanitizer(sanitizeFreeTextValue),
    validateBodyMiddleware("contact-us/questions/index.njk"),
  ];
}

export function getErrorMessageForIssueDescription(
  theme: string,
  subtheme: string
): string | undefined {
  if (theme === CONTACT_US_THEMES.SOMETHING_ELSE) {
    return "pages.contactUsQuestions.anotherProblem.section1.errorMessage";
  }
  if (theme === CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK) {
    return "pages.contactUsQuestions.suggestionOrFeedback.section1.errorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_ADDRESS) {
    return "pages.contactUsQuestions.provingIdentityProblemEnteringAddress.whatHappened.errorMessage";
  }
  if (theme === CONTACT_US_THEMES.PROVING_IDENTITY) {
    return "pages.contactUsQuestions.provingIdentity.section1.errorMessage";
  }
  if (theme === CONTACT_US_THEMES.ID_CHECK_APP) {
    return getErrorMessageForIdCheckAppIssueDescription(subtheme);
  }
  if (subtheme === CONTACT_US_THEMES.ACCOUNT_NOT_FOUND) {
    return "pages.contactUsQuestions.accountNotFound.section1.errorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.TECHNICAL_ERROR) {
    return "pages.contactUsQuestions.technicalError.section1.errorMessage";
  }
  if (theme === CONTACT_US_THEMES.SIGNING_IN) {
    return getErrorMessageForSigningInIssueDescription(subtheme);
  }
  if (theme === CONTACT_US_THEMES.ACCOUNT_CREATION) {
    return getErrorMessageForAccountCreationIssueDescription(subtheme);
  }
  if (subtheme === CONTACT_US_THEMES.AUTHENTICATOR_APP_PROBLEM) {
    return "pages.contactUsQuestions.authenticatorApp.section1.errorMessage";
  }
  if (theme === CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE) {
    return getErrorMessageForFaceToFaceIssueDescription(subtheme);
  }
}

export function getErrorMessageForFaceToFaceIssueDescription(
  subtheme: string
): string | undefined {
  const errorMessagesForFaceToFaceIssueDescription = {
    [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_ENTERING_DETAILS]:
      "pages.contactUsQuestions.provingIdentityFaceToFaceDetails.whatHappened.errorMessage",
    [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_LETTER]:
      "pages.contactUsQuestions.provingIdentityFaceToFaceLetter.whatHappened.errorMessage",
    [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_AT_POST_OFFICE]:
      "pages.contactUsQuestions.provingIdentityFaceToFacePostOffice.whatHappened.errorMessage",
    [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_FINDING_RESULT]:
      "pages.contactUsQuestions.provingIdentityFaceToFaceIdResults.whatHappened.errorMessage",
    [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_CONTINUING]:
      "pages.contactUsQuestions.provingIdentityFaceToFaceService.whatHappened.errorMessage",
    [CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_TECHNICAL_PROBLEM]:
      "pages.contactUsQuestions.provingIdentityFaceToFaceTechnicalProblem.section1.errorMessage",
  };

  return errorMessagesForFaceToFaceIssueDescription[subtheme];
}

export function getErrorMessageForAccountCreationIssueDescription(
  subtheme: string
): string | undefined {
  if (subtheme === CONTACT_US_THEMES.SOMETHING_ELSE) {
    return "pages.contactUsQuestions.accountCreationProblem.section1.errorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.AUTHENTICATOR_APP_PROBLEM) {
    return "pages.contactUsQuestions.anotherProblem.section1.errorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.SIGN_IN_PHONE_NUMBER_ISSUE) {
    return "pages.contactUsQuestions.signInPhoneNumberIssue.section1.errorMessage";
  }
}

export function getErrorMessageForSigningInIssueDescription(
  subtheme: string
): string | undefined {
  if (subtheme === CONTACT_US_THEMES.SOMETHING_ELSE) {
    return "pages.contactUsQuestions.signignInProblem.section1.errorMessage";
  }
}

export function getErrorMessageForIdCheckAppIssueDescription(
  subtheme: string
): string | undefined {
  if (subtheme === CONTACT_US_THEMES.ID_CHECK_APP_TECHNICAL_ERROR) {
    return "pages.contactUsQuestions.idCheckAppTechnicalProblem.section1.errorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.ID_CHECK_APP_SOMETHING_ELSE) {
    return "pages.contactUsQuestions.idCheckAppSomethingElse.section1.errorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.TAKING_PHOTO_OF_ID_PROBLEM) {
    return "pages.contactUsQuestions.whatHappened.errorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.LINKING_PROBLEM) {
    return "pages.contactUsQuestions.whatHappened.errorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.FACE_SCANNING_PROBLEM) {
    return "pages.contactUsQuestions.whatHappened.errorMessage";
  }
}

export function getLengthExceededErrorMessageForIssueDescription(
  theme: string,
  subtheme: string
): string | undefined {
  if (theme === CONTACT_US_THEMES.ACCOUNT_CREATION) {
    return getLengthExceededErrorMessageForAccountCreationIssueDescription(subtheme);
  }
  if (theme === CONTACT_US_THEMES.SIGNING_IN) {
    return getLengthExceededErrorMessageForSigningInIssueDescription(subtheme);
  }
  if (theme === CONTACT_US_THEMES.SOMETHING_ELSE) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage";
  }
  if (theme === CONTACT_US_THEMES.ID_CHECK_APP) {
    return getLengthExceededErrorMessageForIdCheckAppIssueDescription(subtheme);
  }
  if (theme === CONTACT_US_THEMES.PROVING_IDENTITY) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage";
  }
  if (theme === CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.suggestionFeedbackTooLongMessage";
  }
}

export function getLengthExceededErrorMessageForAccountCreationIssueDescription(
  subtheme: string
): string | undefined {
  if (subtheme === CONTACT_US_THEMES.AUTHENTICATOR_APP_PROBLEM) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage";
  }
  if (subtheme === CONTACT_US_THEMES.TECHNICAL_ERROR) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage";
  }
  if (subtheme === CONTACT_US_THEMES.SOMETHING_ELSE) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.anythingElseTooLongMessage";
  }
  if (subtheme === CONTACT_US_THEMES.SIGN_IN_PHONE_NUMBER_ISSUE) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage";
  }
}

export function getLengthExceededErrorMessageForIdCheckAppIssueDescription(
  subtheme: string
): string | undefined {
  if (subtheme === CONTACT_US_THEMES.LINKING_PROBLEM) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.whatHappenedTooLongMessage";
  }
  if (subtheme === CONTACT_US_THEMES.TAKING_PHOTO_OF_ID_PROBLEM) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.whatHappenedTooLongMessage";
  }
  if (subtheme === CONTACT_US_THEMES.FACE_SCANNING_PROBLEM) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.whatHappenedTooLongMessage";
  }
  if (subtheme === CONTACT_US_THEMES.ID_CHECK_APP_TECHNICAL_ERROR) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage";
  }
  if (subtheme === CONTACT_US_THEMES.ID_CHECK_APP_SOMETHING_ELSE) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage";
  }
}

export function getLengthExceededErrorMessageForSigningInIssueDescription(
  subtheme: string
): string | undefined {
  if (subtheme === CONTACT_US_THEMES.ACCOUNT_NOT_FOUND) {
    return "pages.contactUsQuestions.accountNotFound.section1.entryTooLongErrorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.TECHNICAL_ERROR) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage";
  }
  if (subtheme === CONTACT_US_THEMES.SOMETHING_ELSE) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.anythingElseTooLongMessage";
  }
}

export function getErrorMessageForAdditionalDescription(
  theme: string,
  subtheme: string
): string | undefined {
  if (theme === CONTACT_US_THEMES.SOMETHING_ELSE) {
    return "pages.contactUsQuestions.anotherProblem.section2.errorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_ADDRESS) {
    return "pages.contactUsQuestions.provingIdentityProblemEnteringAddress.whatWereYouTryingToDo.errorMessage";
  }
  if (theme === CONTACT_US_THEMES.PROVING_IDENTITY) {
    return "pages.contactUsQuestions.provingIdentity.section2.errorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.TECHNICAL_ERROR) {
    return "pages.contactUsQuestions.technicalError.section2.errorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.AUTHENTICATOR_APP_PROBLEM) {
    return "pages.contactUsQuestions.authenticatorApp.section2.errorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.ID_CHECK_APP_TECHNICAL_ERROR) {
    return "pages.contactUsQuestions.idCheckAppTechnicalProblem.section2.errorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.ID_CHECK_APP_SOMETHING_ELSE) {
    return "pages.contactUsQuestions.idCheckAppTechnicalProblem.section2.errorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_TECHNICAL_PROBLEM) {
    return "pages.contactUsQuestions.provingIdentityFaceToFaceTechnicalProblem.section2.errorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_ANOTHER_PROBLEM) {
    return "pages.contactUsQuestions.provingIdentityFaceToFaceSomethingElse.section2.errorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.SIGN_IN_PHONE_NUMBER_ISSUE) {
    return "pages.contactUsQuestions.signInPhoneNumberIssue.section2.errorMessage";
  }
}
