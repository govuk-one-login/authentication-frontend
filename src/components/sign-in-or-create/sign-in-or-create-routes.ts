import { PATH_NAMES } from "../../app.constants";
import * as express from "express";
import {
  signInOrCreateGet,
  signInOrCreatePost,
} from "./sign-in-or-create-controller";
import { validateSignInOrCreateRequest } from "./sign-in-or-create-validation";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";

const router = express.Router();

router.get(
  PATH_NAMES.SIGN_IN_OR_CREATE,
  validateSessionMiddleware,
  asyncHandler(signInOrCreateGet())
);

router.post(
  PATH_NAMES.SIGN_IN_OR_CREATE,
  validateSessionMiddleware,
  validateSignInOrCreateRequest(),
  signInOrCreatePost
);

export { router as signInOrCreateRouter };
