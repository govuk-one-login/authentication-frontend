import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { PATH_NAMES } from "../../app.constants.js";
import { resetPasswordResendCode2faSmsGet } from "./reset-password-resend-code-2fa-sms-controller.js";

const router = express.Router();

router.get(
  PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  resetPasswordResendCode2faSmsGet
);

export { router as resetPasswordResendCode2faRouter };
