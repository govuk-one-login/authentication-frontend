import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { accountNotFoundGet } from "./account-not-found-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.ACCOUNT_NOT_FOUND,
  validateSessionMiddleware,
  accountNotFoundGet
);

export { router as accountNotFoundRouter };