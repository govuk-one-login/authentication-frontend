import { PATH_NAMES } from "../../app.constants";
import { validateEnterEmailRequest } from "./enter-email-validation";
import {
  enterEmailPost,
  enterEmailGet,
  enterEmailCreatePost,
  enterEmailCreateGet,
  enterEmailCreateRequestGet,
} from "./enter-email-controller";
import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.ENTER_EMAIL_SIGN_IN,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  enterEmailGet
);
router.get(
  PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  enterEmailCreateGet
);
router.get(
  PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT_REQUEST,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  enterEmailCreateRequestGet
);

router.post(
  PATH_NAMES.ENTER_EMAIL_SIGN_IN,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateEnterEmailRequest(),
  asyncHandler(enterEmailPost())
);

router.post(
  PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateEnterEmailRequest("enter-email/index-create-account.njk"),
  asyncHandler(enterEmailCreatePost())
);

export { router as enterEmailRouter };
