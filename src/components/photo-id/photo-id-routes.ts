import { PATH_NAMES } from "../../app.constants";
import * as express from "express";

import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { allowUserJourneyMiddleware } from "../../middleware/allow-user-journey-middleware";
import {
  photoIdGet,
  photoIdPost,
  noPhotoIdGet
} from "./photo-id-controller";
import { validatePhotoIdRequest } from "./photo-id-validation";


const router = express.Router();

router.get(
  PATH_NAMES.PHOTO_ID,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  photoIdGet
);

router.post(
  PATH_NAMES.PHOTO_ID,
  validatePhotoIdRequest(),
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  photoIdPost
);

router.get(
  PATH_NAMES.NO_PHOTO_ID,
  validateSessionMiddleware,
  allowUserJourneyMiddleware,
  noPhotoIdGet
);

export { router as photoIdRouter };