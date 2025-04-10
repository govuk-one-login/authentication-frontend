import { PATH_NAMES } from "../../app.constants";
import * as express from "express";
import {
  signInOrCreateGet,
  signInOrCreatePost,
} from "./sign-in-or-create-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowAndPersistUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import { asyncHandler } from "../../utils/async";

const router = express.Router();

router.get(
  PATH_NAMES.SIGN_IN_OR_CREATE,
  validateSessionMiddleware,
  asyncHandler(allowAndPersistUserJourneyMiddleware),
  signInOrCreateGet
);

router.post(
  PATH_NAMES.SIGN_IN_OR_CREATE,
  validateSessionMiddleware,
  asyncHandler(allowAndPersistUserJourneyMiddleware),
  signInOrCreatePost
);

export { router as signInOrCreateRouter };
