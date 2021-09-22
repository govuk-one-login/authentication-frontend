import * as express from "express";
import { PATH_NAMES } from "../../app.constants";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";
import {
  checkYourEmailGet,
  checkYourEmailPost,
} from "./check-your-email-controller";
import { validateCheckYourEmailRequest } from "./check-your-email-validation";

const router = express.Router();

router.get(
  PATH_NAMES.CHECK_YOUR_EMAIL,
  validateSessionMiddleware,
  checkYourEmailGet
);

router.post(
  PATH_NAMES.CHECK_YOUR_EMAIL,
  validateSessionMiddleware,
  validateCheckYourEmailRequest(),
  asyncHandler(checkYourEmailPost())
);

export { router as checkYourEmailRouter };
