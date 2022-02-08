import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { accountCreatedGet } from "./account-created-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  accountCreatedGet
);

export { router as registerAccountCreatedRouter };
