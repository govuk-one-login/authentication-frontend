import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { PATH_NAMES } from "../../app.constants";
import express from "express";
import {
  checkYourPhoneGet,
  checkYourPhonePost,
} from "./check-your-phone-controller";
import { asyncHandler } from "../../utils/async";
import { validateSmsCodeRequest } from "./check-your-phone-validation";

const router = express.Router();

router.get(
  PATH_NAMES.CHECK_YOUR_PHONE,
  validateSessionMiddleware,
  checkYourPhoneGet
);

router.post(
  PATH_NAMES.CHECK_YOUR_PHONE,
  validateSessionMiddleware,
  validateSmsCodeRequest(),
  asyncHandler(checkYourPhonePost())
);
export { router as checkYourPhoneRouter };
