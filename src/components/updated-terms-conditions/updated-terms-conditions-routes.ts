import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import {
  termsConditionsNotAccepted,
  updatedTermsConditionsGet,
  updatedTermsConditionsPost,
  updatedTermsRejectedGet,
} from "./updated-terms-conditions-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";

const router = express.Router();

router.get(
  PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS,
  validateSessionMiddleware,
  asyncHandler(updatedTermsConditionsGet())
);

router.get(
  PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS_DISAGREE,
  validateSessionMiddleware,
  asyncHandler(updatedTermsRejectedGet())
);

router.get(
  PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS_NOT_ACCEPTED,
  termsConditionsNotAccepted
);

router.post(
  PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS,
  validateSessionMiddleware,
  asyncHandler(updatedTermsConditionsPost())
);

export { router as updatedTermsConditionsRouter };
