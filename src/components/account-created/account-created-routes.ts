import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { registerAccountCreatedGet } from "./account-created-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL,
  validateSessionMiddleware,
  registerAccountCreatedGet
);

export { router as registerAccountCreatedRouter };
