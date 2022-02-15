import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import {
  updatedTermsConditionsGet,
  updatedTermsConditionsPost,
  updatedTermsRejectedGet,
} from "./updated-terms-conditions-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  updatedTermsConditionsGet
);

router.get(
  PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS_DISAGREE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  updatedTermsRejectedGet
);

router.post(
  PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  asyncHandler(updatedTermsConditionsPost())
);

export { router as updatedTermsConditionsRouter };
