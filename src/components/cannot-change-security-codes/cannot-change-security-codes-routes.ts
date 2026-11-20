import * as express from "express";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import {
  cannotChangeSecurityCodesGet,
  cannotChangeSecurityCodesPost,
} from "./cannot-change-security-codes-controller.js";
import { PATH_NAMES } from "../../app.constants.js";
import { validateCannotChangeHowGetSecurityCodesActionRequest } from "./cannot-change-security-codes-validation.js";

const router = express.Router();

router.get(
  PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  cannotChangeSecurityCodesGet
);

router.post(
  PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateCannotChangeHowGetSecurityCodesActionRequest(),
  cannotChangeSecurityCodesPost
);

router.get(
  PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  cannotChangeSecurityCodesGet
);

router.post(
  PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateCannotChangeHowGetSecurityCodesActionRequest(),
  cannotChangeSecurityCodesPost
);

router.get(
  PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_NO_IDENTITY_DELETE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  cannotChangeSecurityCodesGet
);

router.post(
  PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_NO_IDENTITY_DELETE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateCannotChangeHowGetSecurityCodesActionRequest(),
  cannotChangeSecurityCodesPost
);

export { router as cannotChangeSecurityCodesRouter };
