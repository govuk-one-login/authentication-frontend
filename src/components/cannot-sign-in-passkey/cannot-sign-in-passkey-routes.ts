import express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { cannotSignInPasskeyGet } from "./cannot-sign-in-passkey-controller.js";
import { validateCannotSignInPasskeyRequest } from "./cannot-sign-in-passkey-validation.js";

const router = express.Router();

router.get(
  PATH_NAMES.CANNOT_SIGN_IN_PASSKEY,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  cannotSignInPasskeyGet()
);

router.post(
  PATH_NAMES.CANNOT_SIGN_IN_PASSKEY,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateCannotSignInPasskeyRequest()
);

export { router as cannotSignInPasskeyRouter };
