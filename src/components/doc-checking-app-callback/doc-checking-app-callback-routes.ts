import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import { docCheckingAppCallbackGet } from "./doc-checking-app-callback-controller";

const router = express.Router();

router.get(
  PATH_NAMES.DOC_CHECKING_APP_CALLBACK,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  docCheckingAppCallbackGet
);

export { router as docCheckingAppCallbackRouter };
