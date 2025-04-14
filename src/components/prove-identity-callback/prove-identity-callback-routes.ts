import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import {
  proveIdentityCallbackGetOrPost,
  proveIdentityCallbackSessionExpiryError,
  proveIdentityStatusCallbackGet,
} from "./prove-identity-callback-controller";
import { processIdentityRateLimitMiddleware } from "../../middleware/process-identity-rate-limit-middleware";

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
