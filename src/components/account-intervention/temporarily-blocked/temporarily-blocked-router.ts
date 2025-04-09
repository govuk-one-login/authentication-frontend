import { PATH_NAMES } from "../../../app.constants.js";
import * as express from "express";
import { validateSessionMiddleware } from "../../../middleware/session-middleware.js";
import { temporarilyBlockedGet } from "./temporarily-blocked-controller.js";
const router = express.Router();

router.get(
  PATH_NAMES.UNAVAILABLE_TEMPORARY,
  validateSessionMiddleware,
  temporarilyBlockedGet
);

export { router as temporarilyBlockedRouter };
