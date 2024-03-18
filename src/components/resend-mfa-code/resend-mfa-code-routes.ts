import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import {
  resendMfaCodeGet,
  resendMfaCodePost,
} from "./resend-mfa-code-controller";
import { asyncHandler } from "../../utils/async";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import {
  accountLockingAccountRecoveryMiddleware,
  accountLockingMiddleware, accountLockingResetPasswordMiddleware,
} from "../../middleware/account-locking-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.RESEND_MFA_CODE,
  validateSessionMiddleware,
  accountLockingAccountRecoveryMiddleware,
  accountLockingMiddleware,
  accountLockingResetPasswordMiddleware,
  allowUserJourneyMiddleware,
  resendMfaCodeGet
);

router.post(
  PATH_NAMES.RESEND_MFA_CODE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  asyncHandler(resendMfaCodePost())
);

export { router as resendMfaCodeRouter };
