import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";

export function validateContactUsQuestionsRequest(): ValidationChainFunc {
  return [
    body("issueDescription")
      .optional()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("error-message", { value });
      }),
    body("additionalDescription")
      .optional()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("temp-error-message", { value });
      }),
    body("replyEmail")
      .if(body("feedbackContact").equals("true"))
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsPublic.section3.replyEmail.validationError.required",
          { value }
        );
      })
      .isEmail()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsPublic.section3.replyEmail.validationError.invalidFormat",
          { value }
        );
      }),
    body("name")
      .if(body("feedbackContact").equals("true"))
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsPublic.section3.name.validationError.required",
          { value }
        );
      }),
    validateBodyMiddleware("contact-us/questions/index.njk"),
  ];
}
