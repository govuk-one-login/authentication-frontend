import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import {
  resendMfaCodeGet,
  resendMfaCodePost,
} from "./resend-mfa-code-controller";
import { asyncHandler } from "../../utils/async";
import { csrfMiddleware } from "../../middleware/csrf-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.RESEND_MFA_CODE,
  validateSessionMiddleware,
  csrfMiddleware,
  resendMfaCodeGet
);

router.post(
  PATH_NAMES.RESEND_MFA_CODE,
  validateSessionMiddleware,
  csrfMiddleware,
  asyncHandler(resendMfaCodePost())
);

export { router as resendMfaCodeRouter };
