import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import {
  enterPasswordGet,
  enterPasswordPost,
} from "./enter-password-controller";
import { validateEnterPasswordRequest } from "./enter-password-validation";
import { validateSessionMiddleware } from "../../middleware/session-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.ENTER_PASSWORD,
  validateSessionMiddleware,
  enterPasswordGet
);

router.post(
  PATH_NAMES.ENTER_PASSWORD,
  validateSessionMiddleware,
  validateEnterPasswordRequest(),
  enterPasswordPost()
);

export { router as enterPasswordRouter };
