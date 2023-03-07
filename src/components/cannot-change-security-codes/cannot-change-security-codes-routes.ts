import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { cannotChangeSecurityCodesGet } from "./cannot-change-security-codes-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  cannotChangeSecurityCodesGet
);

export { router as cannotChangeSecurityCodesRouter };
