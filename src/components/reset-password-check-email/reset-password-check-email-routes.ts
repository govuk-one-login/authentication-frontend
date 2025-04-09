import { PATH_NAMES } from "../../app.constants.js";
import * as express from "express";
import {
  resetPasswordCheckEmailGet,
  resetPasswordCheckEmailPost,
  resetPasswordResendCodeGet,
} from "./reset-password-check-email-controller.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { validateResetPasswordCheckEmailRequest } from "./reset-password-check-email-validation.js";

const router = express.Router();

router.get(
  PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  resetPasswordCheckEmailGet()
);

router.post(
  PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateResetPasswordCheckEmailRequest(),
  resetPasswordCheckEmailPost()
);

router.get(
  PATH_NAMES.RESET_PASSWORD_RESEND_CODE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  resetPasswordResendCodeGet
);

export { router as resetPasswordCheckEmailRouter };
