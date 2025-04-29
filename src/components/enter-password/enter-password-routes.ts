import { PATH_NAMES } from "../../app.constants.js";

import * as express from "express";
import {
  enterPasswordAccountExistsGet,
  enterPasswordAccountLockedGet,
  enterPasswordGet,
  enterPasswordPost,
  enterSignInRetryBlockedGet,
} from "./enter-password-controller.js";
import {
  validateEnterPasswordAccountExistsRequest,
  validateEnterPasswordRequest,
} from "./enter-password-validation.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";

const router = express.Router();

router.get(
  PATH_NAMES.ENTER_PASSWORD,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  enterPasswordGet
);

router.get(
  PATH_NAMES.ENTER_PASSWORD_ACCOUNT_EXISTS,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  enterPasswordAccountExistsGet
);

router.get(
  PATH_NAMES.ACCOUNT_LOCKED,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  enterPasswordAccountLockedGet
);

router.get(PATH_NAMES.SIGN_IN_RETRY_BLOCKED, enterSignInRetryBlockedGet());

router.post(
  PATH_NAMES.ENTER_PASSWORD,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateEnterPasswordRequest(),
  enterPasswordPost()
);

router.post(
  PATH_NAMES.ENTER_PASSWORD_ACCOUNT_EXISTS,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateEnterPasswordAccountExistsRequest(),
  enterPasswordPost(true)
);

export { router as enterPasswordRouter };
