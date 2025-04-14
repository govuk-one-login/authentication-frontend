import * as express from "express";
import { PATH_NAMES } from "../../app.constants";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import {
  checkYourEmailGet,
  checkYourEmailPost,
} from "./check-your-email-controller";
import { validateCheckYourEmailRequest } from "./check-your-email-validation";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.CHECK_YOUR_EMAIL,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  checkYourEmailGet
);

router.post(
  PATH_NAMES.CHECK_YOUR_EMAIL,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateCheckYourEmailRequest(),
  checkYourEmailPost()
);

export { router as checkYourEmailRouter };
