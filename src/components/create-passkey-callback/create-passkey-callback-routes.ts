import * as express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { createPasskeyCallbackGet } from "./create-passkey-callback-controller.js";

const router = express.Router();

router.get(
  PATH_NAMES.CREATE_PASSKEY_CALLBACK,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  createPasskeyCallbackGet
);

export { router as createPasskeyCallbackRouter };
