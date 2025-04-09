import { PATH_NAMES } from "../../app.constants.js";
import * as express from "express";
import {
  accountNotFoundGet,
  accountNotFoundPost,
} from "./account-not-found-controller.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";

const router = express.Router();

router.get(
  PATH_NAMES.ACCOUNT_NOT_FOUND,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  accountNotFoundGet
);

router.post(
  PATH_NAMES.ACCOUNT_NOT_FOUND,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  accountNotFoundPost()
);

export { router as accountNotFoundRouter };
