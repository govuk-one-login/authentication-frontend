import { PATH_NAMES } from "../../app.constants.js";

import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { authCodeGet } from "./auth-code-controller.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { asyncHandler } from "../../utils/async.js";
import { accountInterventionsMiddleware } from "../../middleware/account-interventions-middleware.js";

const router = express.Router();

router.get(
  PATH_NAMES.AUTH_CODE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  asyncHandler(accountInterventionsMiddleware(false, true, true)),
  asyncHandler(authCodeGet())
);

export { router as authCodeRouter };
