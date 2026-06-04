import { PATH_NAMES } from "../../app.constants.js";
import * as express from "express";
import {
  signInWithPasskeyGet,
  signInWithPasskeyPost,
} from "./sign-in-with-passkey-controller.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowAndPersistUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";

const router = express.Router();

router.get(
  PATH_NAMES.SIGN_IN_WITH_PASSKEY,
  validateSessionMiddleware,
  allowAndPersistUserJourneyMiddleware,
  signInWithPasskeyGet()
);

router.post(
  PATH_NAMES.SIGN_IN_WITH_PASSKEY,
  validateSessionMiddleware,
  allowAndPersistUserJourneyMiddleware,
  signInWithPasskeyPost()
);

export { router as signInWithPasskeyRouter };
