import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { PATH_NAMES } from "../../app.constants.js";
import express from "express";
import { checkYourPhoneGet, checkYourPhonePost } from "./check-your-phone-controller.js";
import { validateSmsCodeRequest } from "./check-your-phone-validation.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
const router = express.Router();

router.get(
  PATH_NAMES.CHECK_YOUR_PHONE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  checkYourPhoneGet
);

router.post(
  PATH_NAMES.CHECK_YOUR_PHONE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateSmsCodeRequest(),
  checkYourPhonePost()
);
export { router as checkYourPhoneRouter };
