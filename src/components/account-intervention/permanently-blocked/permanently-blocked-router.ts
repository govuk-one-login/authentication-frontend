import { PATH_NAMES } from "../../../app.constants.js";
import * as express from "express";
import { validateSessionMiddleware } from "../../../middleware/session-middleware.js";
import { permanentlyBlockedGet } from "./permanently-blocked-controller.js";
const router = express.Router();

router.get(
  PATH_NAMES.UNAVAILABLE_PERMANENT,
  validateSessionMiddleware,
  permanentlyBlockedGet
);

export { router as permanentlyBlockedRouter };
