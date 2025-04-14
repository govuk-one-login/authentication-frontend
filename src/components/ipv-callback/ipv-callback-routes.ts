import * as express from "express";
import { PATH_NAMES } from "../../app.constants";
import {
  cannotChangeSecurityCodesGet,
  cannotChangeSecurityCodesPost,
  ipvCallbackGet,
} from "./ipv-callback-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import { validateCannotChangeHowGetSecurityCodesActionRequest } from "./cannot-change-how-get-security-codes-validation";
import { crossBrowserMiddleware } from "./cross-browser-middleware";
import { CrossBrowserService } from "./cross-browser-service";

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
