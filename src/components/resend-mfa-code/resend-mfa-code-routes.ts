import { PATH_NAMES } from "../../app.constants.js";
import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import {
  resendMfaCodeGet,
  resendMfaCodePost,
} from "./resend-mfa-code-controller.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";

const router = express.Router();

router.get(
  PATH_NAMES.RESEND_MFA_CODE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  resendMfaCodeGet
);

router.post(
  PATH_NAMES.RESEND_MFA_CODE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  resendMfaCodePost()
);

export { router as resendMfaCodeRouter };
