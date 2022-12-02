import { PATH_NAMES } from "../../app.constants";

import * as express from "express";

import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import {
  proveIdentityWelcomeGet,
  proveIdentityWelcomePost,
} from "./prove-identity-welcome-controller";

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
