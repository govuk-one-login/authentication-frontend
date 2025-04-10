import * as express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { asyncHandler } from "../../utils/async.js";
import { validateResetPasswordRequest } from "./reset-password-validation.js";
import {
  resetPasswordGet,
  resetPasswordPost,
  resetPasswordRequestGet,
  resetPasswordRequiredGet,
} from "./reset-password-controller.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { accountInterventionsMiddleware } from "../../middleware/account-interventions-middleware.js";
const router = express.Router();

router.get(
  PATH_NAMES.RESET_PASSWORD_REQUEST,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  resetPasswordRequestGet
);

router.get(
  PATH_NAMES.RESET_PASSWORD,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  asyncHandler(accountInterventionsMiddleware(true, false)),
  resetPasswordGet
);

router.post(
  PATH_NAMES.RESET_PASSWORD,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateResetPasswordRequest(),
  asyncHandler(resetPasswordPost())
);

router.get(
  PATH_NAMES.RESET_PASSWORD_REQUIRED,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  resetPasswordRequiredGet
);

router.post(
  PATH_NAMES.RESET_PASSWORD_REQUIRED,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateResetPasswordRequest(),
  asyncHandler(resetPasswordPost())
);

export { router as resetPasswordRouter };
