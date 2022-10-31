import { PATH_NAMES } from "../../app.constants";

import { validateSessionMiddleware } from "../../middleware/session-middleware";
import {
  resendEmailCodeGet,
  resendEmailCodePost,
  securityCodeCheckTimeLimit,
} from "./resend-email-code-controller";
import { asyncHandler } from "../../utils/async";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import express from "express";

const router = express.Router();

router.get(
  PATH_NAMES.RESEND_EMAIL_CODE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  resendEmailCodeGet
);

router.post(
  PATH_NAMES.RESEND_EMAIL_CODE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  asyncHandler(resendEmailCodePost())
);

router.get(
  PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT,
  validateSessionMiddleware,
  asyncHandler(securityCodeCheckTimeLimit())
);

export { router as resendEmailCodeRouter };
