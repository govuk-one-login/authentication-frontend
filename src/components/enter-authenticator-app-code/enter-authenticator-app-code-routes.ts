import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { PATH_NAMES } from "../../app.constants.js";
import express from "express";
import {
  enterAuthenticatorAppCodeGet,
  enterAuthenticatorAppCodePost,
} from "./enter-authenticator-app-code-controller.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { validateEnterAuthenticatorAppCodeRequest } from "./enter-authenticator-app-code-validation.js";

const router = express.Router();

router.get(
  PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  enterAuthenticatorAppCodeGet()
);

router.post(
  PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateEnterAuthenticatorAppCodeRequest(),
  enterAuthenticatorAppCodePost()
);
export { router as enterAuthenticatorAppCodeRouter };
