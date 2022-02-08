import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { shareInfoGet, shareInfoPost } from "./share-info-controller";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";
import { validateShareInfoRequest } from "./share-info-validation";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";

const router = express.Router();

router.get(
  PATH_NAMES.SHARE_INFO,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  asyncHandler(shareInfoGet())
);

router.post(
  PATH_NAMES.SHARE_INFO,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  validateShareInfoRequest(),
  asyncHandler(shareInfoPost())
);

export { router as shareInfoRouter };
