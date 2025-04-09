import * as express from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { validateSessionMiddleware } from "../../../middleware/session-middleware.js";
import { checkAccountRecoveryPermitted } from "./check-account-recovery-middleware.js";
import { sendEmailOtp } from "./send-email-otp-middleware.js";
import {
  checkYourEmailSecurityCodesGet,
  checkYourEmailSecurityCodesPost,
} from "./check-your-email-security-codes-controller.js";
import { validateCheckYourEmailRequest } from "./check-your-email-security-codes-validation.js";
import { allowUserJourneyMiddleware } from "../../../middleware/allow-user-journey-middleware.js";
const router = express.Router();

router.get(
  PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  checkAccountRecoveryPermitted,
  sendEmailOtp(),
  checkYourEmailSecurityCodesGet
);

router.post(
  PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  checkAccountRecoveryPermitted,
  validateCheckYourEmailRequest(),
  checkYourEmailSecurityCodesPost()
);
export { router as checkYourEmailSecurityCodesRouter };
