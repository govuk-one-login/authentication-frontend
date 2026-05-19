import { PATH_NAMES } from "../../app.constants.js";
import { Router } from "express";
import { accountExistsWithPasskeyGet } from "./account-exists-with-passkey-controller.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";

const router = Router();

router.get(
  PATH_NAMES.ACCOUNT_EXISTS_WITH_PASSKEY,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  accountExistsWithPasskeyGet
);

export { router as accountExistsWithPasskeyRouter };
