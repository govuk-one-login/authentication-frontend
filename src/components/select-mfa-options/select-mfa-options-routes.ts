import { PATH_NAMES } from "../../app.constants.js";
import * as express from "express";
import {
  getSecurityCodesGet,
  getSecurityCodesPost,
} from "./select-mfa-options-controller.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { validateMultiFactorAuthenticationRequest } from "./select-mfa-options-validation.js";
const router = express.Router();

router.get(
  PATH_NAMES.GET_SECURITY_CODES,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  getSecurityCodesGet
);

router.post(
  PATH_NAMES.GET_SECURITY_CODES,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateMultiFactorAuthenticationRequest(),
  getSecurityCodesPost
);

export { router as selectMFAOptionsRouter };
