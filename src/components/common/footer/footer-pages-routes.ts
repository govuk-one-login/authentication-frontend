import { PATH_NAMES } from "../../../app.constants.js";
import {
  accessibilityStatementGet,
  privacyStatementGet,
  termsConditionsGet,
  supportGet,
  supportPost,
} from "./footer-pages-controller.js";
import * as express from "express";
import { validateSupportRequest } from "./support-validation.js";
const router = express.Router();

router.get(PATH_NAMES.ACCESSIBILITY_STATEMENT, accessibilityStatementGet);
router.get(PATH_NAMES.PRIVACY_POLICY, privacyStatementGet);
router.get(PATH_NAMES.PRIVACY_STATEMENT, privacyStatementGet);
router.get(PATH_NAMES.TERMS_AND_CONDITIONS, termsConditionsGet);
router.get(PATH_NAMES.SUPPORT, supportGet);
router.post(PATH_NAMES.SUPPORT, validateSupportRequest(), supportPost);

export { router as footerRouter };
