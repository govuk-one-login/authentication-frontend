import * as express from "express";
import {
  ENTER_EMAIL_TEMPLATE,
  enterEmailGet,
  enterEmailPost,
  enterEmailValidationSchema,
} from "./controllers/enter-email-controller";
import { PATH_NAMES } from "./app.constants";
import { validateBodyMiddleware } from "./middleware/form-validation-middleware";
import {
  enterPasswordGet,
  enterPasswordPost,
  enterPasswordValidationSchema,
} from "./controllers/enter-password-controller";
import { csrfMiddleware } from "./middleware/csrf-middleware";
import {
  accessibilityStatementGet,
  privacyStatementGet,
  termsConditionsGet,
} from "./controllers/footer-pages-controller";
import {
  createAccountGet,
  createAccountPost,
  createPasswordValidationSchema,
} from "./controllers/create-account";
import { enterPhoneNumberGet } from "./controllers/enter-phone-number-controller";

const router = express.Router();

router.get("/", csrfMiddleware, enterEmailGet);

router.get(PATH_NAMES.ENTER_EMAIL, csrfMiddleware, enterEmailGet);

router.post(
  PATH_NAMES.ENTER_EMAIL,
  csrfMiddleware,
  enterEmailValidationSchema(),
  validateBodyMiddleware(ENTER_EMAIL_TEMPLATE),
  enterEmailPost()
);

router.get(
  PATH_NAMES.ENTER_PASSWORD,
  csrfMiddleware,
  enterPasswordValidationSchema(),
  enterPasswordGet
);
router.post(
  PATH_NAMES.ENTER_PASSWORD,
  csrfMiddleware,
  enterPasswordValidationSchema(),
  validateBodyMiddleware("enter-password.html"),
  enterPasswordPost
);

router.get(
  PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD,
  csrfMiddleware,
  createAccountGet
);
router.post(
  PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD,
  csrfMiddleware,
  createPasswordValidationSchema(),
  validateBodyMiddleware("create-account.html"),
  createAccountPost()
);

router.get(
  PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
  csrfMiddleware,
  enterPhoneNumberGet
);

//footer pages
router.get(PATH_NAMES.ACCESSIBILITY_STATEMENT, accessibilityStatementGet);
router.get(PATH_NAMES.PRIVACY_POLICY, privacyStatementGet);
router.get(PATH_NAMES.TERMS_AND_CONDITIONS, termsConditionsGet);

export { router };
