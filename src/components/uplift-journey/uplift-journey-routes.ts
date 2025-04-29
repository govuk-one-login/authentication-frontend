import { PATH_NAMES } from "../../app.constants.js";
import * as express from "express";

import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { upliftJourneyGet } from "./uplift-journey-controller.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";

const router = express.Router();

router.get(
  PATH_NAMES.UPLIFT_JOURNEY,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  upliftJourneyGet()
);

export { router as upliftJourneyRouter };
