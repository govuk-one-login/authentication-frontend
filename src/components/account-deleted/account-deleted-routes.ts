import { PATH_NAMES } from "../../app.constants.js";
import * as express from "express";
import {
  accountDeletedGet,
  accountDeletedPost,
} from "./account-deleted-controller.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";

const router = express.Router();

router.get(
  PATH_NAMES.ACCOUNT_DELETED,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  accountDeletedGet
);

router.post(
  PATH_NAMES.ACCOUNT_DELETED,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  accountDeletedPost
);

export { router as accountDeletedRouter };
