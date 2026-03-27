import express from "express";
import {
  createPasskeyGet,
  createPasskeyPost,
} from "./create-passkey-controller.js";
import { PATH_NAMES } from "../../app.constants.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import {
  allowUserJourneyMiddleware,
} from "../../middleware/allow-user-journey-middleware.js";
const router = express.Router();

router.get(
  PATH_NAMES.CREATE_PASSKEY,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  createPasskeyGet
);

router.post(
  PATH_NAMES.CREATE_PASSKEY,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  createPasskeyPost()
);

export { router as createPasskeyRouter };
