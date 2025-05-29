import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware.js";
import type { ValidationChainFunc } from "../../types.js";
export function getContactUsErrorMessage(theme: string): string {
  let errorMessage: string = "pages.contactUsPublic.section3.errorMessage";
  if (theme === "signing_in") {
    errorMessage = "pages.contactUsFurtherInformation.signingIn.section1.errorMessage";
  } else if (theme === "account_creation") {
    errorMessage =
      "pages.contactUsFurtherInformation.accountCreation.section1.errorMessage";
  } else if (theme === "id_check_app") {
    errorMessage = "pages.contactUsFurtherInformation.idCheckApp.section1.errorMessage";
  } else if (theme === "id_face_to_face") {
    errorMessage =
      "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.errorMessage";
  } else if (theme === "proving_identity") {
    errorMessage =
      "pages.contactUsFurtherInformation.provingIdentity.section1.errorMessage";
  }
  return errorMessage;
}

export function validateContactUsRequest(
  template: string,
  bodyType: string
): ValidationChainFunc {
  return [
    body(bodyType)
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(getContactUsErrorMessage(req.body.theme), {
          value,
        });
      }),
    validateBodyMiddleware(template),
  ];
}
