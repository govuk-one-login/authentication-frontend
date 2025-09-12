import express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import {
  cannotUseEmailAddressContinueGet,
  cannotUseEmailAddressGet,
} from "./cannot-use-email-address-controller.js";

const router = express.Router();

router.get(PATH_NAMES.CANNOT_USE_EMAIL_ADDRESS, cannotUseEmailAddressGet);

router.get(
  PATH_NAMES.CANNOT_USE_EMAIL_ADDRESS_CONTINUE,
  cannotUseEmailAddressContinueGet
);

export { router as cannotUseEmailAddressRouter };
