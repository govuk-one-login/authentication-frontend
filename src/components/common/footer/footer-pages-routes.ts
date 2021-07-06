import { PATH_NAMES } from "../../../app.constants";
import {
  accessibilityStatementGet,
  privacyStatementGet,
  termsConditionsGet,
} from "./footer-pages-controller";

import * as express from "express";

const router = express.Router();

router.get(PATH_NAMES.ACCESSIBILITY_STATEMENT, accessibilityStatementGet);
router.get(PATH_NAMES.PRIVACY_POLICY, privacyStatementGet);
router.get(PATH_NAMES.TERMS_AND_CONDITIONS, termsConditionsGet);

export { router as footerRouter };
