import { PATH_NAMES } from "../../app.constants";
import * as express from "express";

import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import {
  setupAuthenticatorAppGet,
  setupAuthenticatorAppPost,
} from "./setup-authenticator-app-controller";
import { validateSetupAuthAppRequest } from "./setup-authenticator-app-validation";

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
