import * as express from "express";
import {
  enterEmailGet,
  enterEmailPost,
  validateEnterEmailRequest,
} from "./controllers/enter-email-controller";
import { PATH_NAMES } from "./app.constants";
import {
  enterPasswordGet,
  enterPasswordPost,
  validateEnterPasswordRequest,
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
  validateCreatePasswordRequest,
} from "./controllers/register-create-password-controller";
import { enterPhoneNumberGet } from "./controllers/register-enter-phone-number-controller";
import {
  createSessionMiddleware,
  validateSessionMiddleware,
} from "./middleware/session-middleware";
import {
  registerAccountCreatedGet,
  registerAccountCreatedPost,
} from "./controllers/register-account-created-controller";
import { checkYourEmailGet } from "./controllers/check-your-email-controller";

const basicMiddlewarePipeline = [validateSessionMiddleware, csrfMiddleware];

const router = express.Router();

router.get(
  "/",
  createSessionMiddleware,
  basicMiddlewarePipeline,
  enterEmailGet
);

router.get(PATH_NAMES.ENTER_EMAIL, basicMiddlewarePipeline, enterEmailGet);

router.post(
  PATH_NAMES.ENTER_EMAIL,
  basicMiddlewarePipeline,
  validateEnterEmailRequest(),
  enterEmailPost()
);

router.get(
  PATH_NAMES.CHECK_YOUR_EMAIL,
  basicMiddlewarePipeline,
  checkYourEmailGet
);

router.get(
  PATH_NAMES.ENTER_PASSWORD,
  basicMiddlewarePipeline,
  enterPasswordGet
);
router.post(
  PATH_NAMES.ENTER_PASSWORD,
  basicMiddlewarePipeline,
  validateEnterPasswordRequest(),
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
  validateCreatePasswordRequest(),
  createAccountPost()
);

router.get(
  PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
  csrfMiddleware,
  enterPhoneNumberGet
);

router.get(
  PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL,
  basicMiddlewarePipeline,
  registerAccountCreatedGet
);
router.post(
  PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL,
  basicMiddlewarePipeline,
  registerAccountCreatedPost
);

//footer pages
router.get(PATH_NAMES.ACCESSIBILITY_STATEMENT, accessibilityStatementGet);
router.get(PATH_NAMES.PRIVACY_POLICY, privacyStatementGet);
router.get(PATH_NAMES.TERMS_AND_CONDITIONS, termsConditionsGet);

export { router };
