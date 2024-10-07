import { PATH_NAMES } from "../../../app.constants";
import {
  accessibilityStatementGet,
  privacyStatementGet,
  termsConditionsGet,
  supportGet,
  supportPost,
} from "./footer-pages-controller";

import * as express from "express";
import { validateSupportRequest } from "./support-validation";
import { getRequestTaxonomyMiddleware } from "../../../middleware/get-request-taxonomy-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.ACCESSIBILITY_STATEMENT,
  getRequestTaxonomyMiddleware,
  accessibilityStatementGet
);
router.get(
  PATH_NAMES.PRIVACY_POLICY,
  getRequestTaxonomyMiddleware,
  privacyStatementGet
);
router.get(
  PATH_NAMES.PRIVACY_STATEMENT,
  getRequestTaxonomyMiddleware,
  privacyStatementGet
);
router.get(
  PATH_NAMES.TERMS_AND_CONDITIONS,
  getRequestTaxonomyMiddleware,
  termsConditionsGet
);
router.get(PATH_NAMES.SUPPORT, supportGet);
router.post(PATH_NAMES.SUPPORT, validateSupportRequest(), supportPost);

export { router as footerRouter };
