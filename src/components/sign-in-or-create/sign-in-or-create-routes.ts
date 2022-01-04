import { PATH_NAMES } from "../../app.constants";
import * as express from "express";
import { signInOrCreateGet } from "./sign-in-or-create-controller";
import { asyncHandler } from "../../utils/async";
import { validateSessionMiddleware } from "../../middleware/session-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.SIGN_IN_OR_CREATE,
  validateSessionMiddleware,
  asyncHandler(signInOrCreateGet())
);

export { router as signInOrCreateRouter };
