import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { asyncHandler } from "../../utils/async";
import { proveIdentityGet } from "./prove-identity-controller";

const router = express.Router();

router.get(PATH_NAMES.PROVE_IDENTITY, validateSessionMiddleware, asyncHandler(proveIdentityGet()));

export { router as proveIdentityRouter };
