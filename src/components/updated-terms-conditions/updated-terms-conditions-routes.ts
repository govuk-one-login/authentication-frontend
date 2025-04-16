import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import {
  updatedTermsConditionsGet,
  updatedTermsConditionsPost,
} from "./updated-terms-conditions-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  updatedTermsConditionsGet
);

router.post(
  PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  updatedTermsConditionsPost()
);

export { router as updatedTermsConditionsRouter };
