import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";

export function validateContactUsRequest(): ValidationChainFunc {
  return [
    body("issueDescription")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.contactUsPublic.section2.question1.validationError.required",
          { value }
        );
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
    validateBodyMiddleware("contact-us/index-public-contact-us.njk"),
  ];
}
