import express from "express";
import { PATH_NAMES } from "../../app.constants";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import { asyncHandler } from "../../utils/async";
import {
  mfaResetOpenInBrowserGet,
  mfaResetWithIpvGet,
} from "./mfa-reset-with-ipv-controller";
import { checkAccountRecoveryPermittedViaIpv } from "./check-account-recovery-via-ipv-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.MFA_RESET_WITH_IPV,
  validateSessionMiddleware,
  checkAccountRecoveryPermittedViaIpv,
  allowUserJourneyMiddleware,
  asyncHandler(mfaResetWithIpvGet())
);

router.get(
  PATH_NAMES.OPEN_IN_WEB_BROWSER,
  validateSessionMiddleware, //TODO journey middleware
  asyncHandler(mfaResetOpenInBrowserGet())
);

export { router as mfaResetWithIpvRouter };
