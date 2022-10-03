import { body, check } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";

export function validatePhotoIdRequest(): ValidationChainFunc {
  return [
    body("havePhotoId")
      .if(check("auth").isEmpty())
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.photoId.section2.errorMessage", {
          value,
        });
      }),
    validateBodyMiddleware("photo-id/index.njk"),
  ];
}
