import * as express from "express";
import {
  enterEmailGet,
  enterEmailPost,
  enterEmailValidationRules,
} from "./controllers/enter-email-controller";
import { pathName } from "./app.constants";
import { validateBodyMiddleware } from "./middleware/form-validation-middleware";
import { enterPasswordGet } from "./controllers/enter-password-controller";
import { csrfMiddleware } from "./middleware/csrf-middleware";
import {accessibilityStatementGet, privacyStatementGet, termsConditionsGet} from "./controllers/footer-controller";

const router = express.Router();

router.get("/", csrfMiddleware, enterEmailGet);

router.get(pathName.ENTER_EMAIL, csrfMiddleware, enterEmailGet);

router.post(
  pathName.ENTER_EMAIL,
  csrfMiddleware,
  enterEmailValidationRules(),
  validateBodyMiddleware("enter-email.html"),
  enterEmailPost()
);

router.get(pathName.ENTER_PASSWORD, enterPasswordGet);

router.get(pathName.CREATE_ACCOUNT_SET_PASSWORD, enterPasswordGet);

router.get(pathName.ACCESSIBILITY_STATEMENT, accessibilityStatementGet);
router.get(pathName.PRIVACY_POLICY, privacyStatementGet);
router.get(pathName.TERMS_AND_CONDITIONS, termsConditionsGet);

export { router };
