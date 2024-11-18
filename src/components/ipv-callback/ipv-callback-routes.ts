import * as express from "express";
import { asyncHandler } from "../../utils/async";
import { PATH_NAMES } from "../../app.constants";
import { ipvCallbackGet } from "./ipv-callback-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.IPV_CALLBACK,
  validateSessionMiddleware,
  asyncHandler(ipvCallbackGet())
);

export { router as ipvCallbackRouter };
