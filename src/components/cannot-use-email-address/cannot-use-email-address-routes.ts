import express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { cannotUseEmailAddressGet } from "./cannot-use-email-address-controller.js";

const router = express.Router()

router.get(
  PATH_NAMES.CANNOT_USE_EMAIL_ADDRESS,
  cannotUseEmailAddressGet
)

export {router as cannotUseEmailAddressRouter}