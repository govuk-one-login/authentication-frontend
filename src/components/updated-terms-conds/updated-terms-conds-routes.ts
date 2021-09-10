import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import {
  updatedTermsCondsGet,
  updatedTermsCondsMandatoryGet,
  updatedTermsCondsOptionalGet,
  updatedTermsCondsPost,
} from "./updated-terms-conds-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";

const router = express.Router();

router.get(
  PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS,
  validateSessionMiddleware,
  asyncHandler(updatedTermsCondsGet())
);

router.get(
  PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS_MANDATORY,
  validateSessionMiddleware,
  asyncHandler(updatedTermsCondsMandatoryGet())
);

router.get(
  PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS_OPTIONAL,
  validateSessionMiddleware,
  asyncHandler(updatedTermsCondsOptionalGet())
);

router.post(
  PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS,
  validateSessionMiddleware,
  asyncHandler(updatedTermsCondsPost())
);

export { router as updatedTermsCondsRouter };
