import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { browserBackButtonErrorGet } from "./browser-back-button-error-controller";

const router = express.Router();

router.get(
  PATH_NAMES.INVALID_SESSION,
  validateSessionMiddleware,
  browserBackButtonErrorGet
);

export { router as browserBackButtonErrorRouter };
