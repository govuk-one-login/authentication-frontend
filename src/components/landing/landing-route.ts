import * as express from "express";
import { landingGet } from "./landing-controller.js";
import { PATH_NAMES } from "../../app.constants.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { asyncHandler } from "../../utils/async.js";

const router = express.Router();

router.get(
  PATH_NAMES.ROOT,
  validateSessionMiddleware,
  asyncHandler(landingGet)
);

export { router as landingRouter };
