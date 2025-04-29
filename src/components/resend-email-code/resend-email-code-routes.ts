import { PATH_NAMES } from "../../app.constants.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import {
  resendEmailCodeGet,
  resendEmailCodePost,
  securityCodeCheckTimeLimit,
} from "./resend-email-code-controller.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
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
  resendEmailCodePost()
);

router.get(
  PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT,
  validateSessionMiddleware,
  securityCodeCheckTimeLimit()
);

export { router as resendEmailCodeRouter };
