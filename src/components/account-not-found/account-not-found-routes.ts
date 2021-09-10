import { PATH_NAMES } from "../../app.constants";
import * as express from "express";
import {
  accountNotFoundGet,
  accountNotFoundPost,
} from "./account-not-found-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";

const router = express.Router();

router.get(
  PATH_NAMES.ACCOUNT_NOT_FOUND,
  validateSessionMiddleware,
  accountNotFoundGet
);

router.post(
  PATH_NAMES.ACCOUNT_NOT_FOUND,
  validateSessionMiddleware,
  asyncHandler(accountNotFoundPost())
);

export { router as accountNotFoundRouter };
