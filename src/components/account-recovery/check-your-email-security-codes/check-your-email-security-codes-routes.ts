import * as express from "express";
import { PATH_NAMES } from "../../../app.constants";
import { validateSessionMiddleware } from "../../../middleware/session-middleware";
import { checkAccountRecoveryPermitted } from "./check-account-recovery-middleware";
import { sendEmailOtp } from "./send-email-otp-middleware";
import {
  checkYourEmailSecurityCodesGet,
  checkYourEmailSecurityCodesPost,
} from "./check-your-email-security-codes-controller";
import { validateCheckYourEmailRequest } from "./check-your-email-security-codes-validation";
import { allowUserJourneyMiddleware } from "../../../middleware/allow-user-journey-middleware";

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
