import { PATH_NAMES } from "../../app.constants.js";
import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import {
  proveIdentityCallbackGetOrPost,
  proveIdentityCallbackSessionExpiryError,
  proveIdentityStatusCallbackGet,
} from "./prove-identity-callback-controller.js";
import { processIdentityRateLimitMiddleware } from "../../middleware/process-identity-rate-limit-middleware.js";

const router = express.Router();

router.get(
  PATH_NAMES.PROVE_IDENTITY_CALLBACK,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  processIdentityRateLimitMiddleware,
  proveIdentityCallbackGetOrPost()
);

router.post(
  PATH_NAMES.PROVE_IDENTITY_CALLBACK,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  processIdentityRateLimitMiddleware,
  proveIdentityCallbackGetOrPost()
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
  proveIdentityStatusCallbackGet()
);

export { router as proveIdentityCallbackRouter };
