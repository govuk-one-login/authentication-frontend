import { PATH_NAMES } from "../../app.constants.js";

import * as express from "express";

import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import {
  proveIdentityWelcomeGet,
  proveIdentityWelcomePost,
} from "./prove-identity-welcome-controller.js";

const router = express.Router();

router.get(
  PATH_NAMES.PROVE_IDENTITY_WELCOME,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  proveIdentityWelcomeGet
);

router.post(
  PATH_NAMES.PROVE_IDENTITY_WELCOME,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  proveIdentityWelcomePost
);

export { router as proveIdentityWelcomeRouter };
