import * as express from "express";
import { PATH_NAMES } from "../../app.constants";

import { asyncHandler } from "../../utils/async";
import { validateResetPasswordRequest } from "./reset-password-validation";
import {
  resetPasswordConfirmationGet,
  resetPasswordExpiredLinkGet,
  resetPasswordGet,
  resetPasswordPost,
} from "./reset-password-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.RESET_PASSWORD,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  resetPasswordGet
);

router.get(
  PATH_NAMES.RESET_PASSWORD_CONFIRMATION,
  resetPasswordConfirmationGet
);

router.get(PATH_NAMES.RESET_PASSWORD_EXPIRED_LINK, resetPasswordExpiredLinkGet);

router.post(
  PATH_NAMES.RESET_PASSWORD,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateResetPasswordRequest(),
  asyncHandler(resetPasswordPost())
);

export { router as resetPasswordRouter };
