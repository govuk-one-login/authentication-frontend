import * as express from "express";
import { PATH_NAMES } from "../../app.constants";
import {
  enterPhoneNumberGet,
  enterPhoneNumberPost,
} from "./enter-phone-number-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { validateEnterPhoneNumberRequest } from "./enter-phone-number-validation";

const router = express.Router();

router.get(
  PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
  validateSessionMiddleware,
  enterPhoneNumberGet
);

router.post(
  PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
  validateSessionMiddleware,
  validateEnterPhoneNumberRequest(),
  enterPhoneNumberPost
);

export { router as enterPhoneNumberRouter };
