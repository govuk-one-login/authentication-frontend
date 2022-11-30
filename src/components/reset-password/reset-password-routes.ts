import * as express from "express";
import { PATH_NAMES } from "../../app.constants";

import { asyncHandler } from "../../utils/async";
import { validateResetPasswordRequest } from "./reset-password-validation";
import {
  resetPasswordGet,
  resetPasswordPost,
  resetPasswordRequestGet,
  resetPasswordRequiredGet,
} from "./reset-password-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

const router = express.Router();

router.get(PATH_NAMES.RESET_PASSWORD_REQUEST, resetPasswordRequestGet);

router.get(
  PATH_NAMES.RESET_PASSWORD,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  resetPasswordGet
);

router.post(
  PATH_NAMES.RESET_PASSWORD,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateResetPasswordRequest(),
  asyncHandler(resetPasswordPost())
);

router.get(PATH_NAMES.RESET_PASSWORD_REQUIRED, resetPasswordRequiredGet);

router.post(
  PATH_NAMES.RESET_PASSWORD_REQUIRED,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateResetPasswordRequest(),
  asyncHandler(resetPasswordPost())
);

export { router as resetPasswordRouter };
