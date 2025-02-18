import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { PATH_NAMES } from "../../app.constants";
import express from "express";
import { enterMfaGet, enterMfaPost } from "./enter-mfa-controller";
import { asyncHandler } from "../../utils/async";
import { validateEnterMfaRequest } from "./enter-mfa-validation";
import {
  allowAndPersistUserJourneyMiddleware,
  allowUserJourneyMiddleware,
} from "../../middleware/allow-user-journey-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.ENTER_MFA,
  validateSessionMiddleware,
  asyncHandler(allowAndPersistUserJourneyMiddleware),
  asyncHandler(enterMfaGet())
);

router.post(
  PATH_NAMES.ENTER_MFA,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateEnterMfaRequest(),
  asyncHandler(enterMfaPost())
);
export { router as enterMfaRouter };
