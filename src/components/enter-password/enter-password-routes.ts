import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import {
  enterPasswordAccountExistsGet,
  enterPasswordGet,
  enterPasswordPost,
} from "./enter-password-controller";
import {
  validateEnterPasswordAccountExistsRequest,
  validateEnterPasswordRequest,
} from "./enter-password-validation";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";

const router = express.Router();

router.get(
  PATH_NAMES.ENTER_PASSWORD,
  validateSessionMiddleware,
  enterPasswordGet
);

router.get(
  "/enter-password-account-exists",
  validateSessionMiddleware,
  enterPasswordAccountExistsGet
);

router.post(
  PATH_NAMES.ENTER_PASSWORD,
  validateSessionMiddleware,
  validateEnterPasswordRequest(),
  asyncHandler(enterPasswordPost())
);

router.post(
  PATH_NAMES.ENTER_PASSWORD_ACCOUNT_EXISTS,
  validateSessionMiddleware,
  validateEnterPasswordAccountExistsRequest(),
  asyncHandler(enterPasswordPost(true))
);

export { router as enterPasswordRouter };
