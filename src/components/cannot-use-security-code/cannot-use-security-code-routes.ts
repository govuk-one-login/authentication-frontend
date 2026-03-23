import * as express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { cannotUseSecurityCodeGet } from "./cannot-use-security-code-controller.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";

const router = express.Router();

router.get(
  PATH_NAMES.CANNOT_USE_SECURITY_CODE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  cannotUseSecurityCodeGet()
);

export { router as cannotUseSecurityCodeRouter };
