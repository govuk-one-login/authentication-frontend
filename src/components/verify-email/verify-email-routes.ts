import * as express from "express";
import { PATH_NAMES } from "../../app.constants";
import { verifyEmailGet, verifyEmailPost } from "./verify-email-controller";
import { validateVerifyEmailRequest } from "./verify-email-validation";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";

const router = express.Router();

router.get(
  PATH_NAMES.CHECK_YOUR_EMAIL,
  validateSessionMiddleware,
  verifyEmailGet
);

router.post(
  PATH_NAMES.CHECK_YOUR_EMAIL,
  validateSessionMiddleware,
  validateVerifyEmailRequest(),
  asyncHandler(verifyEmailPost())
);

export { router as verifyEmailRouter };
