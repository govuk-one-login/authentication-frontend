import { Router } from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { sfadCallbackGet } from "./sfad-callback-controller.js";

const router = Router();

router.get(
  PATH_NAMES.SFAD_CALLBACK,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  sfadCallbackGet()
);

export { router as sfadCallbackRouter };
