import { PATH_NAMES } from "../../app.constants.js";
import * as express from "express";
import { passkeyCreatedGet } from "./passkey-created-controller.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";

const router = express.Router();

router.get(
  PATH_NAMES.PASSKEY_CREATED,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  passkeyCreatedGet
);

export { router as passkeyCreatedRouter };
