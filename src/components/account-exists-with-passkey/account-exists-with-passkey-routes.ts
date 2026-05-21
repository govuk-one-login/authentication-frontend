import { PATH_NAMES } from "../../app.constants.js";
import { Router } from "express";
import {
  accountExistsWithPasskeyGet,
  accountExistsWithPasskeyPost,
} from "./account-exists-with-passkey-controller.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";

const router = Router();

router.get(
  PATH_NAMES.ACCOUNT_EXISTS_WITH_PASSKEY,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  accountExistsWithPasskeyGet
);

router.post(
  PATH_NAMES.ACCOUNT_EXISTS_WITH_PASSKEY,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  accountExistsWithPasskeyPost()
);

export { router as accountExistsWithPasskeyRouter };
