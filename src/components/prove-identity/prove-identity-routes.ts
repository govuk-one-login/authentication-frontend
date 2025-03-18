import { PATH_NAMES } from "../../app.constants.js";

import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { asyncHandler } from "../../utils/async.js";
import { proveIdentityGet } from "./prove-identity-controller.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { accountInterventionsMiddleware } from "../../middleware/account-interventions-middleware.js";

const router = express.Router();

router.get(
  PATH_NAMES.PROVE_IDENTITY,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  asyncHandler(accountInterventionsMiddleware(false, true)),
  asyncHandler(proveIdentityGet())
);

export { router as proveIdentityRouter };
