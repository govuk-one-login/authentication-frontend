import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import {
  resendMfaCodeGet,
  resendMfaCodePost,
} from "./resend-mfa-code-controller";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

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
