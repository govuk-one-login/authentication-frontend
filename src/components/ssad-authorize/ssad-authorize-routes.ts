import express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { ssadAuthorizeGet } from "./ssad-authorize-controller.js";

const router = express.Router();

router.get(
  PATH_NAMES.SSAD_AUTHORIZE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  ssadAuthorizeGet()
);

export { router as ssadAuthorizeRouter };
