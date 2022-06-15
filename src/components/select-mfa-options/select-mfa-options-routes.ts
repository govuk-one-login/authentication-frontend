import { PATH_NAMES } from "../../app.constants";
import * as express from "express";
import {
  getSecurityCodesGet,
  getSecurityCodesPost,
} from "./select-mfa-options-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import { validateMultiFactorAuthenticationRequest } from "./select-mfa-options-validation";

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
