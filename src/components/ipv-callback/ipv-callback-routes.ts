import * as express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { ipvCallbackGet } from "./ipv-callback-controller.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { crossBrowserMiddleware } from "./cross-browser-middleware.js";
import { CrossBrowserService } from "./cross-browser-service.js";

const router = express.Router();

router.get(
  PATH_NAMES.IPV_CALLBACK,
  crossBrowserMiddleware(new CrossBrowserService()),
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  ipvCallbackGet()
);

export { router as ipvCallbackRouter };
