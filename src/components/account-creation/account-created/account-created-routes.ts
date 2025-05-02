import { PATH_NAMES } from "../../../app.constants.js";
import * as express from "express";
import {
  accountCreatedGet,
  accountCreatedPost,
} from "./account-created-controller.js";
import { validateSessionMiddleware } from "../../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../../middleware/allow-user-journey-middleware.js";
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
