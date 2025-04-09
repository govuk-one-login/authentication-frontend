import { PATH_NAMES } from "../../app.constants.js";
import * as express from "express";

import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import {
  setupAuthenticatorAppGet,
  setupAuthenticatorAppPost,
} from "./setup-authenticator-app-controller.js";
import { validateSetupAuthAppRequest } from "./setup-authenticator-app-validation.js";

const router = express.Router();

router.get(
  PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  setupAuthenticatorAppGet
);

router.post(
  PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateSetupAuthAppRequest(),
  setupAuthenticatorAppPost()
);

export { router as setupAuthenticatorAppRouter };
