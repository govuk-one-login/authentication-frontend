import { PATH_NAMES } from "../../app.constants";
import { validateEnterEmailRequest } from "./enter-email-validation";
import {
  enterEmailPost,
  enterEmailGet,
  enterEmailCreatePost,
} from "./enter-email-controller";
import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";

const router = express.Router();

router.get("/", validateSessionMiddleware, enterEmailGet);

router.get(PATH_NAMES.ENTER_EMAIL, validateSessionMiddleware, enterEmailGet);

router.post(
  PATH_NAMES.ENTER_EMAIL,
  validateSessionMiddleware,
  validateEnterEmailRequest(),
  asyncHandler(enterEmailPost())
);

router.post(
  PATH_NAMES.ENTER_EMAIL_POST_CREATE,
  validateSessionMiddleware,
  validateEnterEmailRequest("enter-email/index-create-account.njk"),
  asyncHandler(enterEmailCreatePost())
);

export { router as enterEmailRouter };
