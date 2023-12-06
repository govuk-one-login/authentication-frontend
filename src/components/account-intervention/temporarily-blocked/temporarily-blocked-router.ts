import { PATH_NAMES } from "../../../app.constants";
import * as express from "express";
import { validateSessionMiddleware } from "../../../middleware/session-middleware";
import { temporarilyBlockedGet } from "./temporarily-blocked-controller";

const router = express.Router();

router.get(
  PATH_NAMES.UNAVAILABLE_TEMPORARY,
  validateSessionMiddleware,
  temporarilyBlockedGet
);

export { router as temporarilyBlockedRouter };
