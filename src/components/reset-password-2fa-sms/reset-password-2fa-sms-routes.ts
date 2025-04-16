import { PATH_NAMES } from "../../app.constants";
import {
  resetPassword2FASmsGet,
  resetPassword2FASmsPost,
} from "./reset-password-2fa-sms-controller";
import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

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
  resetPassword2FASmsPost()
);

export { router as resetPassword2FARouter };
