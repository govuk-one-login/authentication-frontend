import { PATH_NAMES } from "../../../app.constants";
import * as express from "express";
import { validateSessionMiddleware } from "../../../middleware/session-middleware";
import { permanentlyBlockedGet } from "./permanently-blocked-controller";

const router = express.Router();

router.get(
  PATH_NAMES.UNAVAILABLE_PERMANENT,
  validateSessionMiddleware,
  permanentlyBlockedGet
);

export { router as permanentlyBlockedRouter };
