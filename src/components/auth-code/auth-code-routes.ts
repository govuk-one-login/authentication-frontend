import { PATH_NAMES } from "../../app.constants.js";
import * as express from "express";
import {
  requiredSessionFieldsMiddleware,
  validateSessionMiddleware,
} from "../../middleware/session-middleware.js";
import { authCodeGet } from "./auth-code-controller.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { accountInterventionsMiddleware } from "../../middleware/account-interventions-middleware.js";

const router = express.Router();

router.get(
  PATH_NAMES.AUTH_CODE,
  validateSessionMiddleware,
  requiredSessionFieldsMiddleware,
  allowUserJourneyMiddleware,
  accountInterventionsMiddleware(false, true, true),
  authCodeGet()
);

export { router as authCodeRouter };
