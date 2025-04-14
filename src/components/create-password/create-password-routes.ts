import { PATH_NAMES } from "../../app.constants";
import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import {
  createPasswordGet,
  createPasswordPost,
} from "./create-password-controller";
import { validateCreatePasswordRequest } from "./create-password-validation";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  createPasswordGet
);
router.post(
  PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateCreatePasswordRequest(),
  createPasswordPost()
);

export { router as createPasswordRouter };
