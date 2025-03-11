import * as express from "express";
import { landingGet } from "./landing-controller";
import { PATH_NAMES } from "../../app.constants";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";

const router = express.Router();

router.get(
  PATH_NAMES.ROOT,
  validateSessionMiddleware,
  asyncHandler(landingGet)
);

export { router as landingRouter };
