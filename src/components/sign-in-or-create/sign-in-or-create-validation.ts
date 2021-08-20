import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";

export function validateSignInOrCreateRequest(): ValidationChainFunc {
  return [
    body("createAccount")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.signInOrCreate.existingAccountRadios.errorMessage", {
          value,
        });
      }),
    validateBodyMiddleware("sign-in-or-create/index.njk"),
  ];
}
