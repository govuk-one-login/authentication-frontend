import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
export function getContactUsErrorMessage(theme) {
    let errorMessage = "pages.contactUsPublic.section3.errorMessage";
    if (theme === "signing_in") {
        errorMessage =
            "pages.contactUsFurtherInformation.signingIn.section1.errorMessage";
    }
    else if (theme === "account_creation") {
        errorMessage =
            "pages.contactUsFurtherInformation.accountCreation.section1.errorMessage";
    }
    else if (theme === "id_check_app") {
        errorMessage =
            "pages.contactUsFurtherInformation.idCheckApp.section1.errorMessage";
    }
    else if (theme === "id_face_to_face") {
        errorMessage =
            "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.errorMessage";
    }
    else if (theme === "proving_identity") {
        errorMessage =
            "pages.contactUsFurtherInformation.provingIdentity.section1.errorMessage";
    }
    return errorMessage;
}
export function validateContactUsRequest(template, bodyType) {
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
