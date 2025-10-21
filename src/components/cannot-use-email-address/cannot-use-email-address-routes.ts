import express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import {
  cannotUseEmailAddressContinueGet,
  cannotUseEmailAddressGet,
} from "./cannot-use-email-address-controller.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";

const router = express.Router();

router.get(
  PATH_NAMES.CANNOT_USE_EMAIL_ADDRESS,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  cannotUseEmailAddressGet
);

router.get(
  PATH_NAMES.CANNOT_USE_EMAIL_ADDRESS_CONTINUE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  cannotUseEmailAddressContinueGet
);

export { router as cannotUseEmailAddressRouter };
