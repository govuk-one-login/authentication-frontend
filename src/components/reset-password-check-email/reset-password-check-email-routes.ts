import { PATH_NAMES } from "../../app.constants";
import * as express from "express";
import { resetPasswordCheckEmailGet } from "./reset-password-check-email-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  asyncHandler(resetPasswordCheckEmailGet())
);

export { router as resetPasswordCheckEmailRouter };
