import { PATH_NAMES } from "../../../app.constants";

import * as express from "express";
import {
  changeSecurityCodesConfirmationGet,
  changeSecurityCodesConfirmationPost,
} from "./change-security-codes-confirmation-controller";
import { validateSessionMiddleware } from "../../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../../middleware/allow-user-journey-middleware";
import { asyncHandler } from "../../../utils/async";
import { accountLockingMiddleware } from "../../../middleware/account-locking-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  accountLockingMiddleware,
  asyncHandler(changeSecurityCodesConfirmationGet())
);

router.post(
  PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  changeSecurityCodesConfirmationPost
);

export { router as changeSecurityCodesConfirmationRouter };
