import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { securityCodeExpiredGet } from "./security-code-expired-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.SECURITY_CODE_EXPIRED,
  validateSessionMiddleware,
  securityCodeExpiredGet
);

export { router as securityCodeExpiredRouter };
