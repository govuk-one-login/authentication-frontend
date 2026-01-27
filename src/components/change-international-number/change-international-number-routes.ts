import { PATH_NAMES } from "../../app.constants.js";
import express from "express";
import {
  changeInternationalNumberGet,
  changeInternationalNumberPost,
} from "./change-international-number-controller.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";

const router = express.Router();

router.get(
  PATH_NAMES.CHANGE_INTERNATIONAL_NUMBER,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  changeInternationalNumberGet
);

router.post(
  PATH_NAMES.CHANGE_INTERNATIONAL_NUMBER,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  changeInternationalNumberPost
);

export { router as changeInternationalNumberRouter };
