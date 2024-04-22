import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { rpAuthCodeGet } from "./rp-auth-code-controller";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import { asyncHandler } from "../../utils/async";

const router = express.Router();

router.get(
  PATH_NAMES.RP_AUTH_CODE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  asyncHandler(rpAuthCodeGet())
);

export { router as rpAuthCodeRouter };
