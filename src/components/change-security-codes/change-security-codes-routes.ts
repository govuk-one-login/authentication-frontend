import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { changeSecurityCodesGet } from "./change-security-codes-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.CHANGE_SECURITY_CODES,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  changeSecurityCodesGet
);

export { router as changeSecurityCodesRouter };
