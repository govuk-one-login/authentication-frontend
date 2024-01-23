import { body, check } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import {
  CONTACT_US_FIELD_MAX_LENGTH,
  CONTACT_US_THEMES,
  CONTACT_US_COUNTRY_MAX_LENGTH,
} from "../../app.constants";

export function validateContactUsQuestionsRequest(): ValidationChainFunc {
  return [
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
          {
            value,
            lng: req.i18n.lng,
          }
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
          getErrorMessageForAdditionalDescription(
            req.body.theme,
            req.body.subtheme
          ),
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
        return req.t(
          "pages.contactUsQuestions.optionalDescriptionErrorMessage.message",
          { value, lng: req.i18n.lng }
        );
      }),
    body("serviceTryingToUse")
      .optional()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.serviceTryingToUse.errorMessage",
          { value, lng: req.i18n.lng }
        );
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
    body("contact")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.replyByEmail.validationError.noBoxSelected",
          { value, lng: req.i18n.lng }
        );
      }),
    body("email")
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
    body("country")
      .optional()
      .custom((value, { req }) => {
        if (
          req.body.securityCodeSentMethod ===
          "text_message_international_number"
        ) {
          if (!value) {
            throw new Error(
              req.t(
                "pages.contactUsQuestions.textMessageInternationNumberConditionalSection.errorIfBlank",
                {
                  value,
                  lng: req.i18n.lng,
                }
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
    validateBodyMiddleware("contact-us/questions/index.njk"),
  ];
}

export function getErrorMessageForIssueDescription(
  theme: string,
  subtheme: string
): string | undefined {
  if (theme === CONTACT_US_THEMES.EMAIL_SUBSCRIPTIONS) {
    return "pages.contactUsQuestions.emailSubscriptions.section1.errorMessage";
  }
  if (theme === CONTACT_US_THEMES.SOMETHING_ELSE) {
    return "pages.contactUsQuestions.anotherProblem.section1.errorMessage";
  }
  if (theme === CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK) {
    return "pages.contactUsQuestions.suggestionOrFeedback.section1.errorMessage";
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
    return getLengthExceededErrorMessageForAccountCreationIssueDescription(
      subtheme
    );
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
  if (theme === CONTACT_US_THEMES.EMAIL_SUBSCRIPTIONS) {
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
  if (theme === CONTACT_US_THEMES.EMAIL_SUBSCRIPTIONS) {
    return "pages.contactUsQuestions.emailSubscriptions.section1.errorMessage";
  }
  if (theme === CONTACT_US_THEMES.SOMETHING_ELSE) {
    return "pages.contactUsQuestions.anotherProblem.section2.errorMessage";
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
  if (
    subtheme ===
    CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_TECHNICAL_PROBLEM
  ) {
    return "pages.contactUsQuestions.provingIdentityFaceToFaceTechnicalProblem.section2.errorMessage";
  }
  if (
    subtheme === CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_ANOTHER_PROBLEM
  ) {
    return "pages.contactUsQuestions.provingIdentityFaceToFaceSomethingElse.section2.errorMessage";
  }
  if (subtheme === CONTACT_US_THEMES.SIGN_IN_PHONE_NUMBER_ISSUE) {
    return "pages.contactUsQuestions.signInPhoneNumberIssue.section2.errorMessage";
  }
}
