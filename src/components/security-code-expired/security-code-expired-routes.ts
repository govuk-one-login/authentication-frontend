import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import {
  securityCodeExpiredGet,
  securityCodeExpiredPost,
} from "./security-code-expired-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.SECURITY_CODE_EXPIRED,
  validateSessionMiddleware,
  securityCodeExpiredGet
);
router.post(
  PATH_NAMES.SECURITY_CODE_EXPIRED,
  validateSessionMiddleware,
  securityCodeExpiredPost
);

export { router as securityCodeExpiredRouter };
