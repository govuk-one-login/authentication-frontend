import * as express from "express";
import { PATH_NAMES } from "../../app.constants";
import {
  enterPhoneNumberGet,
  enterPhoneNumberPost,
} from "./enter-phone-number-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { validateEnterPhoneNumberRequest } from "./enter-phone-number-validation";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  enterPhoneNumberGet
);

router.post(
  PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateEnterPhoneNumberRequest(),
  enterPhoneNumberPost()
);

export { router as enterPhoneNumberRouter };
