import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import { proveIdentityCallbackGet } from "./prove-identity-callback-controller";

const router = express.Router();

router.get(
  PATH_NAMES.PROVE_IDENTITY_CALLBACK,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  proveIdentityCallbackGet
);

export { router as proveIdentityCallbackRouter };
