import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { PATH_NAMES } from "../../app.constants.js";
import express from "express";
import { enterMfaGet, enterMfaPost } from "./enter-mfa-controller.js";
import { validateEnterMfaRequest } from "./enter-mfa-validation.js";
import {
  allowAndPersistUserJourneyMiddleware,
  allowUserJourneyMiddleware,
} from "../../middleware/allow-user-journey-middleware.js";

const router = express.Router();

router.get(
  PATH_NAMES.ENTER_MFA,
  validateSessionMiddleware,
  allowAndPersistUserJourneyMiddleware,
  enterMfaGet()
);

router.post(
  PATH_NAMES.ENTER_MFA,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateEnterMfaRequest(),
  enterMfaPost()
);
export { router as enterMfaRouter };
