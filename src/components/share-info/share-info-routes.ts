import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { shareInfoGet, shareInfoPost } from "./share-info-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";
import { validateShareInfoRequest } from "./share-info-validation";

const router = express.Router();

router.get(
  PATH_NAMES.SHARE_INFO,
  validateSessionMiddleware,
  asyncHandler(shareInfoGet())
);

router.post(
  PATH_NAMES.SHARE_INFO,
  validateSessionMiddleware,
  validateShareInfoRequest(),
  asyncHandler(shareInfoPost())
);

export { router as shareInfoRouter };
