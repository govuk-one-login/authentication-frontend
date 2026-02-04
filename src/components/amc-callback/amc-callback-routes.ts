import * as express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware.js";
import { amcCallbackGet } from "./amc-callback-controller.js";

const router = express.Router();

router.get(
  PATH_NAMES.AMC_CALLBACK,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  amcCallbackGet()
);

export { router as amcCallbackRouter };
