import * as express from "express";
import { PATH_NAMES } from "../../app.constants";

import { validateResetPasswordRequest } from "./reset-password-validation";
import {
  resetPasswordGet,
  resetPasswordPost,
  resetPasswordRequestGet,
  resetPasswordRequiredGet,
} from "./reset-password-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import { accountInterventionsMiddleware } from "../../middleware/account-interventions-middleware";

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
  accountInterventionsMiddleware(true, false),
  resetPasswordGet
);

router.post(
  PATH_NAMES.RESET_PASSWORD,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateResetPasswordRequest(),
  resetPasswordPost()
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
  resetPasswordPost()
);

export { router as resetPasswordRouter };
