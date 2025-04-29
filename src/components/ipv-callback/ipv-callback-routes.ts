import * as express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import {
  cannotChangeSecurityCodesGet,
  cannotChangeSecurityCodesPost,
  ipvCallbackGet,
} from "./ipv-callback-controller.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { validateCannotChangeHowGetSecurityCodesActionRequest } from "./cannot-change-how-get-security-codes-validation.js";
import { crossBrowserMiddleware } from "./cross-browser-middleware.js";
import { CrossBrowserService } from "./cross-browser-service.js";

const router = express.Router();

router.get(
  PATH_NAMES.IPV_CALLBACK,
  crossBrowserMiddleware(new CrossBrowserService()),
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  ipvCallbackGet()
);

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

export { router as ipvCallbackRouter };
