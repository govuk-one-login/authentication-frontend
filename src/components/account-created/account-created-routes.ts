import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import {
  accountCreatedGet,
  accountCreatedPost,
} from "./account-created-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  accountCreatedGet
);

router.post(
  PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  accountCreatedPost
);

export { router as registerAccountCreatedRouter };
