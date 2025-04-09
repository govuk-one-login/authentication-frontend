import express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import {
  mfaResetOpenInBrowserGet,
  mfaResetWithIpvGet,
} from "./mfa-reset-with-ipv-controller.js";

const router = express.Router();

router.get(
  PATH_NAMES.MFA_RESET_WITH_IPV,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  mfaResetWithIpvGet()
);

router.get(
  PATH_NAMES.OPEN_IN_WEB_BROWSER,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  mfaResetOpenInBrowserGet()
);

export { router as mfaResetWithIpvRouter };
