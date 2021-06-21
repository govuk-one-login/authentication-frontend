import * as express from "express";
import { PATH_NAMES } from "../../app.constants";
import {
  enterPhoneNumberGet,
  enterPhoneNumberPost,
} from "./register-enter-phone-number-controller";
import { basicMiddlewarePipeline } from "../../middleware/middleware-pipeline";
import { validateEnterPhoneNumberRequest } from "./register-enter-phone-number-validation";

const router = express.Router();

router.get(
  PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
  basicMiddlewarePipeline,
  enterPhoneNumberGet
);

router.post(
  PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
  basicMiddlewarePipeline,
  validateEnterPhoneNumberRequest(),
  enterPhoneNumberPost
);

export { router as registerAccountPhoneNumberRouter };
