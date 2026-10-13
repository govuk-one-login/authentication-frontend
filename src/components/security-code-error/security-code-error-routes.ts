import { PATH_NAMES } from "../../app.constants.js";
import express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import {
  securityCodeInvalidRequestGet,
  securityCodeInvalidGet,
  securityCodeTriesExceededGet,
  securityCodeEnteredExceededGet,
} from "./security-code-error-controller.js";
const router = express.Router();

router.get(
  PATH_NAMES.SECURITY_CODE_INVALID,
  validateSessionMiddleware,
  securityCodeInvalidGet
);

router.get(
  PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED,
  validateSessionMiddleware,
  securityCodeTriesExceededGet
);

router.get(
  PATH_NAMES.SECURITY_CODE_INVALID_REQUEST,
  validateSessionMiddleware,
  securityCodeInvalidRequestGet
);

router.get(
  PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
  validateSessionMiddleware,
  securityCodeEnteredExceededGet
);

export { router as securityCodeErrorRouter };
