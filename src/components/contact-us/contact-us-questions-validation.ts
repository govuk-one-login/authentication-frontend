import { body, check } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import { ZENDESK_FIELD_MAX_LENGTH, ZENDESK_THEMES } from "../../app.constants";

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
          }
        );
      }),
    body("issueDescription")
      .optional()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          getErrorMessageForIssueDescription(req.body.theme, req.body.subtheme),
          { value }
        );
      }),
    body("issueDescription")
      .optional()
      .isLength({ max: ZENDESK_FIELD_MAX_LENGTH })
      .withMessage((value, { req }) => {
        return req.t(
          getLengthExceededErrorMessageForIssueDescription(
            req.body.theme,
            req.body.subtheme
          ),
          { value }
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
          { value }
        );
      }),
    body("additionalDescription")
      .optional()
      .isLength({ max: ZENDESK_FIELD_MAX_LENGTH })
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.additionalDescriptionErrorMessage.entryTooLongMessage",
          { value }
        );
      }),
    body("optionalDescription")
      .optional()
      .isLength({ max: ZENDESK_FIELD_MAX_LENGTH })
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.optionalDescriptionErrorMessage.entryTooLongMessage",
          { value }
        );
      }),
    body("moreDetailDescription")
      .optional()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.optionalDescriptionErrorMessage.message",
          { value }
        );
      }),
    body("serviceTryingToUse")
      .optional()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.serviceTryingToUse.errorMessage",
          { value }
        );
      }),
    body("moreDetailDescription")
      .optional()
      .isLength({ max: ZENDESK_FIELD_MAX_LENGTH })
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.optionalDescriptionErrorMessage.entryTooLongMessage",
          { value }
        );
      }),
    body("contact")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.replyByEmail.validationError.noBoxSelected",
          { value }
        );
      }),
    body("email")
      .if(body("contact").equals("true"))
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.replyByEmail.validationError.noEmailAddress",
          { value }
        );
      })
      .isEmail()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.replyByEmail.validationError.invalidFormat",
          { value }
        );
      }),
    validateBodyMiddleware("contact-us/questions/index.njk"),
  ];
}

export function getErrorMessageForIssueDescription(
  theme: string,
  subtheme: string
): string | undefined {
  if (theme === ZENDESK_THEMES.EMAIL_SUBSCRIPTIONS) {
    return "pages.contactUsQuestions.emailSubscriptions.section1.errorMessage";
  }
  if (theme === ZENDESK_THEMES.SOMETHING_ELSE) {
    return "pages.contactUsQuestions.anotherProblem.section1.errorMessage";
  }
  if (theme === ZENDESK_THEMES.SUGGESTIONS_FEEDBACK) {
    return "pages.contactUsQuestions.suggestionOrFeedback.section1.errorMessage";
  }
  if (theme === ZENDESK_THEMES.PROVING_IDENTITY) {
    return "pages.contactUsQuestions.provingIdentity.section1.errorMessage";
  }
  if (theme === ZENDESK_THEMES.ID_CHECK_APP) {
    return getErrorMessageForIdCheckAppIssueDescription(subtheme);
  }
  if (subtheme === ZENDESK_THEMES.ACCOUNT_NOT_FOUND) {
    return "pages.contactUsQuestions.accountNotFound.section1.errorMessage";
  }
  if (subtheme === ZENDESK_THEMES.TECHNICAL_ERROR) {
    return "pages.contactUsQuestions.technicalError.section1.errorMessage";
  }
  if (theme === ZENDESK_THEMES.SIGNING_IN) {
    return getErrorMessageForSigningInIssueDescription(subtheme);
  }
  if (theme === ZENDESK_THEMES.ACCOUNT_CREATION) {
    return getErrorMessageForAccountCreationIssueDescription(subtheme);
  }
  if (subtheme === ZENDESK_THEMES.AUTHENTICATOR_APP_PROBLEM) {
    return "pages.contactUsQuestions.authenticatorApp.section1.errorMessage";
  }
}

export function getErrorMessageForAccountCreationIssueDescription(
  subtheme: string
): string | undefined {
  if (subtheme === ZENDESK_THEMES.SOMETHING_ELSE) {
    return "pages.contactUsQuestions.accountCreationProblem.section1.errorMessage";
  }
  if (subtheme === ZENDESK_THEMES.AUTHENTICATOR_APP_PROBLEM) {
    return "pages.contactUsQuestions.anotherProblem.section1.errorMessage";
  }
}

export function getErrorMessageForSigningInIssueDescription(
  subtheme: string
): string | undefined {
  if (subtheme === ZENDESK_THEMES.SOMETHING_ELSE) {
    return "pages.contactUsQuestions.signignInProblem.section1.errorMessage";
  }
}

export function getErrorMessageForIdCheckAppIssueDescription(
  subtheme: string
): string | undefined {
  if (subtheme === ZENDESK_THEMES.ID_CHECK_APP_TECHNICAL_ERROR) {
    return "pages.contactUsQuestions.idCheckAppTechnicalProblem.section1.errorMessage";
  }
  if (subtheme === ZENDESK_THEMES.ID_CHECK_APP_SOMETHING_ELSE) {
    return "pages.contactUsQuestions.idCheckAppSomethingElse.section1.errorMessage";
  }
  if (subtheme === ZENDESK_THEMES.TAKING_PHOTO_OF_ID_PROBLEM) {
    return "pages.contactUsQuestions.whatHappened.errorMessage";
  }
  if (subtheme === ZENDESK_THEMES.LINKING_PROBLEM) {
    return "pages.contactUsQuestions.whatHappened.errorMessage";
  }
  if (subtheme === ZENDESK_THEMES.FACE_SCANNING_PROBLEM) {
    return "pages.contactUsQuestions.whatHappened.errorMessage";
  }
}

export function getLengthExceededErrorMessageForIssueDescription(
  theme: string,
  subtheme: string
): string | undefined {
  if (theme === ZENDESK_THEMES.ACCOUNT_CREATION) {
    return getLengthExceededErrorMessageForAccountCreationIssueDescription(
      subtheme
    );
  }
  if (theme === ZENDESK_THEMES.SIGNING_IN) {
    return getLengthExceededErrorMessageForSigningInIssueDescription(subtheme);
  }
  if (theme === ZENDESK_THEMES.SOMETHING_ELSE) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage";
  }
  if (theme === ZENDESK_THEMES.ID_CHECK_APP) {
    return getLengthExceededErrorMessageForIdCheckAppIssueDescription(subtheme);
  }
  if (theme === ZENDESK_THEMES.PROVING_IDENTITY) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage";
  }
  if (theme === ZENDESK_THEMES.EMAIL_SUBSCRIPTIONS) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage";
  }
  if (theme === ZENDESK_THEMES.SUGGESTIONS_FEEDBACK) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.suggestionFeedbackTooLongMessage";
  }
}

export function getLengthExceededErrorMessageForAccountCreationIssueDescription(
  subtheme: string
): string | undefined {
  if (subtheme === ZENDESK_THEMES.AUTHENTICATOR_APP_PROBLEM) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage";
  }
  if (subtheme === ZENDESK_THEMES.TECHNICAL_ERROR) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage";
  }
  if (subtheme === ZENDESK_THEMES.SOMETHING_ELSE) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.anythingElseTooLongMessage";
  }
}

export function getLengthExceededErrorMessageForIdCheckAppIssueDescription(
  subtheme: string
): string | undefined {
  if (subtheme === ZENDESK_THEMES.LINKING_PROBLEM) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.whatHappenedTooLongMessage";
  }
  if (subtheme === ZENDESK_THEMES.TAKING_PHOTO_OF_ID_PROBLEM) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.whatHappenedTooLongMessage";
  }
  if (subtheme === ZENDESK_THEMES.FACE_SCANNING_PROBLEM) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.whatHappenedTooLongMessage";
  }
  if (subtheme === ZENDESK_THEMES.ID_CHECK_APP_TECHNICAL_ERROR) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage";
  }
  if (subtheme === ZENDESK_THEMES.ID_CHECK_APP_SOMETHING_ELSE) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage";
  }
}

export function getLengthExceededErrorMessageForSigningInIssueDescription(
  subtheme: string
): string | undefined {
  if (subtheme === ZENDESK_THEMES.ACCOUNT_NOT_FOUND) {
    return "pages.contactUsQuestions.accountNotFound.section1.entryTooLongErrorMessage";
  }
  if (subtheme === ZENDESK_THEMES.TECHNICAL_ERROR) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage";
  }
  if (subtheme === ZENDESK_THEMES.SOMETHING_ELSE) {
    return "pages.contactUsQuestions.issueDescriptionErrorMessage.anythingElseTooLongMessage";
  }
}

export function getErrorMessageForAdditionalDescription(
  theme: string,
  subtheme: string
): string | undefined {
  if (theme === ZENDESK_THEMES.EMAIL_SUBSCRIPTIONS) {
    return "pages.contactUsQuestions.emailSubscriptions.section1.errorMessage";
  }
  if (theme === ZENDESK_THEMES.SOMETHING_ELSE) {
    return "pages.contactUsQuestions.anotherProblem.section2.errorMessage";
  }
  if (theme === ZENDESK_THEMES.PROVING_IDENTITY) {
    return "pages.contactUsQuestions.provingIdentity.section2.errorMessage";
  }
  if (subtheme === ZENDESK_THEMES.TECHNICAL_ERROR) {
    return "pages.contactUsQuestions.technicalError.section2.errorMessage";
  }
  if (subtheme === ZENDESK_THEMES.AUTHENTICATOR_APP_PROBLEM) {
    return "pages.contactUsQuestions.authenticatorApp.section2.errorMessage";
  }
  if (subtheme === ZENDESK_THEMES.ID_CHECK_APP_TECHNICAL_ERROR) {
    return "pages.contactUsQuestions.idCheckAppTechnicalProblem.section2.errorMessage";
  }
  if (subtheme === ZENDESK_THEMES.ID_CHECK_APP_SOMETHING_ELSE) {
    return "pages.contactUsQuestions.idCheckAppTechnicalProblem.section2.errorMessage";
  }
}
