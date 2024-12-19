import * as express from "express";
import { asyncHandler } from "../../utils/async";
import { PATH_NAMES } from "../../app.constants";
import {
  cannotChangeSecurityCodesGet,
  cannotChangeSecurityCodesPost,
  ipvCallbackGet,
} from "./ipv-callback-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import { validateCannotChangeHowGetSecurityCodesActionRequest } from "./cannot-change-how-get-security-codes-validation";

const router = express.Router();

router.get(
  PATH_NAMES.IPV_CALLBACK,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  asyncHandler(ipvCallbackGet())
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

export { router as ipvCallbackRouter };
