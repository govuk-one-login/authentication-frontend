import express from "express";
import {
  createPasskeyGet,
  createPasskeyPost,
} from "./create-passkey-controller.js";
import { PATH_NAMES } from "../../app.constants.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowAndPersistUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
const router = express.Router();

router.get(
  PATH_NAMES.CREATE_PASSKEY,
  validateSessionMiddleware,
  allowAndPersistUserJourneyMiddleware,
  createPasskeyGet
);

router.post(
  PATH_NAMES.CREATE_PASSKEY,
  validateSessionMiddleware,
  allowAndPersistUserJourneyMiddleware,
  createPasskeyPost()
);

export { router as createPasskeyRouter };
