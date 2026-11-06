import { Router } from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { ssadCallbackGet } from "./ssad-callback-controller.js";

const router = Router();

router.get(
  [PATH_NAMES.SSAD_CALLBACK, PATH_NAMES.SSAD_CALLBACK_LEGACY],
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  ssadCallbackGet()
);

export { router as ssadCallbackRouter };
