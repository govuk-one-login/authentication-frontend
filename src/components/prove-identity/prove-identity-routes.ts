import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";
import { proveIdentityGet } from "./prove-identity-controller";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import { accountInterventionsMiddleware } from "../../middleware/account-interventions-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.PROVE_IDENTITY,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  asyncHandler(accountInterventionsMiddleware(false, true)),
  asyncHandler(proveIdentityGet())
);

export { router as proveIdentityRouter };
