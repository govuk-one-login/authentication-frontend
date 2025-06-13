import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware.js";
import type { ValidationChainFunc } from "../../types.js";
import { getIsStrategicAppLive } from "../../config.js";
export function getContactUsErrorMessage(theme: string): string {
  if (theme === "signing_in") {
    return "pages.contactUsFurtherInformation.signingIn.section1.errorMessage";
  }
  if (theme === "account_creation") {
    return "pages.contactUsFurtherInformation.accountCreation.section1.errorMessage";
  }
  if (theme === "id_check_app") {
    if (getIsStrategicAppLive()) {
      return "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.errorMessage";
    } else {
      return "pages.contactUsFurtherInformation.idCheckApp.section1.errorMessage";
    }
  }
  if (theme === "id_face_to_face") {
    return "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.errorMessage";
  }
  if (theme === "proving_identity") {
    return "pages.contactUsFurtherInformation.provingIdentity.section1.errorMessage";
  }
  return "pages.contactUsPublic.section3.errorMessage";
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
