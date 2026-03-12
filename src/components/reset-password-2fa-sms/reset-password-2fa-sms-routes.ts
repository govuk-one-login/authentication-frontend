import { PATH_NAMES } from "../../app.constants.js";
import {
  resetPassword2FASmsGet,
  resetPassword2FASmsPost,
} from "./reset-password-2fa-sms-controller.js";
import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { validateResetPassword2faSMSValidation } from "./reset-password-2fa-sms-validation.js";

const router = express.Router();

router.get(
  PATH_NAMES.RESET_PASSWORD_2FA_SMS,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  resetPassword2FASmsGet()
);

router.post(
  PATH_NAMES.RESET_PASSWORD_2FA_SMS,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateResetPassword2faSMSValidation(),
  resetPassword2FASmsPost()
);

export { router as resetPassword2FARouter };
