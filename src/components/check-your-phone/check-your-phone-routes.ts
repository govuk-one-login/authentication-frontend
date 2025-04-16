import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { PATH_NAMES } from "../../app.constants";
import express from "express";
import {
  checkYourPhoneGet,
  checkYourPhonePost,
} from "./check-your-phone-controller";
import { validateSmsCodeRequest } from "./check-your-phone-validation";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

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
