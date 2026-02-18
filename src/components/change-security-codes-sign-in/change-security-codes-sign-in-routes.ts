import * as express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import {
  changeSecurityCodesSignInGet,
  changeSecurityCodesSignInPost,
} from "./change-security-codes-sign-in-controller.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";

const router = express.Router();

router.get(
  PATH_NAMES.CHANGE_SECURITY_CODES_SIGN_IN,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  changeSecurityCodesSignInGet
);

router.post(
  PATH_NAMES.CHANGE_SECURITY_CODES_SIGN_IN,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  changeSecurityCodesSignInPost()
);

export { router as changeSecurityCodesSignInRouter };
