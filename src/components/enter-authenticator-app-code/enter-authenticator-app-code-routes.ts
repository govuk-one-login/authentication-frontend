import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { PATH_NAMES } from "../../app.constants";
import express from "express";
import {
  enterAuthenticatorAppCodeGet,
  enterAuthenticatorAppCodePost,
} from "./enter-authenticator-app-code-controller";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import { validateEnterAuthenticatorAppCodeRequest } from "./enter-authenticator-app-code-validation";

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
