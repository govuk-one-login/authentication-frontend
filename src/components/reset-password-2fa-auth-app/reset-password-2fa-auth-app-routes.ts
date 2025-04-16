import { PATH_NAMES } from "../../app.constants";
import {
  resetPassword2FAAuthAppGet,
  resetPassword2FAAuthAppPost,
} from "./reset-password-2fa-auth-app-controller";
import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  resetPassword2FAAuthAppGet()
);

router.post(
  PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  resetPassword2FAAuthAppPost()
);

export { router as resetPassword2FAAuthAppRouter };
