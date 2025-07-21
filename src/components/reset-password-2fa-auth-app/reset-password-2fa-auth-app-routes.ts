import { PATH_NAMES } from "../../app.constants.js";
import {
  resetPassword2FAAuthAppGet,
  resetPassword2FAAuthAppPost,
} from "./reset-password-2fa-auth-app-controller.js";
import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { validateResetPassword2faAuthAppRequest } from "./reset-password-2fa-auth-app-validation.js";

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
  validateResetPassword2faAuthAppRequest(),
  resetPassword2FAAuthAppPost()
);

export { router as resetPassword2FAAuthAppRouter };
