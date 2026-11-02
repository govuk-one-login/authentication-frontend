import * as express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import {
  cannotChangeSecurityCodesNoIdentityGet,
  cannotChangeSecurityCodesNoIdentityPost,
} from "./cannot-change-security-codes-no-identity-controller.js";
import { validateCannotChangeSecurityCodesNoIdentityRequest } from "./cannot-change-security-codes-no-identity-validation.js";

const router = express.Router();

router.get(
  PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_NO_IDENTITY,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  cannotChangeSecurityCodesNoIdentityGet
);

router.post(
  PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_NO_IDENTITY,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateCannotChangeSecurityCodesNoIdentityRequest(),
  cannotChangeSecurityCodesNoIdentityPost
);

export { router as cannotChangeSecurityCodesNoIdentityRouter };
