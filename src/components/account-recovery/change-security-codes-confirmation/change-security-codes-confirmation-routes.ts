import { PATH_NAMES } from "../../../app.constants.js";
import * as express from "express";
import {
  changeSecurityCodesConfirmationGet,
  changeSecurityCodesConfirmationPost,
} from "./change-security-codes-confirmation-controller.js";
import { validateSessionMiddleware } from "../../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../../middleware/allow-user-journey-middleware.js";
import { asyncHandler } from "../../../utils/async.js";
const router = express.Router();

router.get(
  PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  asyncHandler(changeSecurityCodesConfirmationGet())
);

router.post(
  PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  changeSecurityCodesConfirmationPost
);

export { router as changeSecurityCodesConfirmationRouter };
