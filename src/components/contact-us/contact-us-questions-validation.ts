import { body, check } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import { ZENDESK_THEMES } from "../../app.constants";

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
    body("moreDetailDescription")
      .optional()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsQuestions.optionalDescriptionErrorMessage.message",
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
): string {
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
  if (subtheme === ZENDESK_THEMES.ACCOUNT_NOT_FOUND) {
    return "pages.contactUsQuestions.accountNotFound.section1.errorMessage";
  }
  if (subtheme === ZENDESK_THEMES.TECHNICAL_ERROR) {
    return "pages.contactUsQuestions.technicalError.section1.errorMessage";
  }
  if (
    theme === ZENDESK_THEMES.SIGNING_IN &&
    subtheme === ZENDESK_THEMES.SOMETHING_ELSE
  ) {
    return "pages.contactUsQuestions.signignInProblem.section1.errorMessage";
  }
  if (
    theme === ZENDESK_THEMES.ACCOUNT_CREATION &&
    subtheme === ZENDESK_THEMES.SOMETHING_ELSE
  ) {
    return "pages.contactUsQuestions.accountCreationProblem.section1.errorMessage";
  }
  if (subtheme === ZENDESK_THEMES.AUTHENTICATOR_APP_PROBLEM) {
    return "pages.contactUsQuestions.authenticatorApp.section1.errorMessage";
  }
}

export function getErrorMessageForAdditionalDescription(
  theme: string,
  subtheme: string
): string {
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
}
