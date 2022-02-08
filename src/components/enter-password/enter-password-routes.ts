import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import {
  enterPasswordAccountExistsGet,
  enterPasswordAccountLockedGet,
  enterPasswordGet,
  enterPasswordPost,
} from "./enter-password-controller";
import {
  validateEnterPasswordAccountExistsRequest,
  validateEnterPasswordRequest,
} from "./enter-password-validation";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

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

router.post(
  PATH_NAMES.ENTER_PASSWORD,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateEnterPasswordRequest(),
  asyncHandler(enterPasswordPost())
);

router.post(
  PATH_NAMES.ENTER_PASSWORD_ACCOUNT_EXISTS,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateEnterPasswordAccountExistsRequest(),
  asyncHandler(enterPasswordPost(true))
);

export { router as enterPasswordRouter };
