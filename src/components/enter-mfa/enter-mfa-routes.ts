import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { PATH_NAMES } from "../../app.constants";
import express from "express";
import { enterMfaGet, enterMfaPost } from "./enter-mfa-controller";
import { asyncHandler } from "../../utils/async";
import { validateEnterMfaRequest } from "./enter-mfa-validation";

const router = express.Router();

router.get(PATH_NAMES.ENTER_MFA, validateSessionMiddleware, enterMfaGet);

router.post(
  PATH_NAMES.ENTER_MFA,
  validateSessionMiddleware,
  validateEnterMfaRequest(),
  asyncHandler(enterMfaPost())
);
export { router as enterMfaRouter };
