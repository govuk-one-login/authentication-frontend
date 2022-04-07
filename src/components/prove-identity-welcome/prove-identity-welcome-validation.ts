import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";

export function validateProveIdentityWelcomeRequest(): ValidationChainFunc {
  return [
    body("chooseWayPyi")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.proveIdentityWelcome.section3.errorMessage", {
          value,
        });
      }),
    validateBodyMiddleware("prove-identity-welcome/index.njk"),
  ];
}
