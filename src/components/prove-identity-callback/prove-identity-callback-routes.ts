import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import {
  proveIdentityCallbackGet,
  proveIdentityCallbackSessionExpiryError,
  proveIdentityStatusCallbackGet,
} from "./prove-identity-callback-controller";
import { asyncHandler } from "../../utils/async";
import { processIdentityRateLimitMiddleware } from "../../middleware/process-identity-rate-limit-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.PROVE_IDENTITY_CALLBACK,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  processIdentityRateLimitMiddleware,
  asyncHandler(proveIdentityCallbackGet())
);

router.get(
  PATH_NAMES.PROVE_IDENTITY_CALLBACK_SESSION_EXPIRY_ERROR,
  proveIdentityCallbackSessionExpiryError
);

router.get(
  PATH_NAMES.PROVE_IDENTITY_CALLBACK_STATUS,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  processIdentityRateLimitMiddleware,
  asyncHandler(proveIdentityStatusCallbackGet())
);

export { router as proveIdentityCallbackRouter };
