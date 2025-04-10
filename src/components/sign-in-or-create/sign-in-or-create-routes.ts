import { PATH_NAMES } from "../../app.constants.js";
import * as express from "express";
import {
  signInOrCreateGet,
  signInOrCreatePost,
} from "./sign-in-or-create-controller.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
const router = express.Router();

router.get(
  PATH_NAMES.SIGN_IN_OR_CREATE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  signInOrCreateGet
);

router.post(
  PATH_NAMES.SIGN_IN_OR_CREATE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  signInOrCreatePost
);

export { router as signInOrCreateRouter };
