import express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { sfadAuthorizeGet } from "./sfad-authorize-controller.js";

const router = express.Router();

router.get(
  PATH_NAMES.SFAD_AUTHORIZE,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  sfadAuthorizeGet()
);

export { router as sfadAuthorizeRouter };
