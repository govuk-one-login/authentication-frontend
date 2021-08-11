import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import {shareInfoGet, shareInfoPost} from "./share-info-controller";
import {validateSessionMiddleware} from "../../middleware/session-middleware";
import {asyncHandler} from "../../utils/async";

const router = express.Router();

router.get(PATH_NAMES.SHARE_INFO, asyncHandler(shareInfoGet()));

router.post(
    PATH_NAMES.SHARE_INFO,
    validateSessionMiddleware,
    asyncHandler(shareInfoPost())
);

export { router as shareInfoRouter };
