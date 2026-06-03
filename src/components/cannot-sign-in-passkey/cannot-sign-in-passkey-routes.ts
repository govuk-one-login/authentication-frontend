import express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowAndPersistUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { cannotSignInPasskeyGet } from "./cannot-sign-in-passkey-controller.js";

const router = express.Router();

router.get(
  PATH_NAMES.CANNOT_SIGN_IN_PASSKEY,
  validateSessionMiddleware,
  allowAndPersistUserJourneyMiddleware,
  cannotSignInPasskeyGet
);

export { router as cannotSignInPasskeyRouter };
