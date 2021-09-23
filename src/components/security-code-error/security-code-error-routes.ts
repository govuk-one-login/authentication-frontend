import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import {
  securityCodeCannotRequestGet,
  securityCodeExpiredGet,
  securityCodeTriesExceededGet,
} from "./security-code-error-controller";

const router = express.Router();

router.get(
  PATH_NAMES.SECURITY_CODE_EXPIRED,
  validateSessionMiddleware,
  securityCodeExpiredGet
);

router.get(
  PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED,
  validateSessionMiddleware,
  securityCodeTriesExceededGet
);

router.get(
  PATH_NAMES.SECURITY_CODE_WAIT,
  validateSessionMiddleware,
  securityCodeCannotRequestGet
);

export { router as securityCodeErrorRouter };
