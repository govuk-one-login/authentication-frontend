import { PATH_NAMES } from "../../app.constants.js";
import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { docCheckingAppGet } from "./doc-checking-app-controller.js";

const router = express.Router();

router.get(
  PATH_NAMES.DOC_CHECKING_APP,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  docCheckingAppGet()
);

export { router as docCheckingAppRouter };
