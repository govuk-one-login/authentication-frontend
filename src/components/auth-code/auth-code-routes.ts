import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { validateSessionMiddleware } from "../../middleware/session-middleware";
import { authCodeGet } from "./auth-code-controller";

const router = express.Router();

router.get(PATH_NAMES.AUTH_CODE, validateSessionMiddleware, authCodeGet);

export { router as authCodeRouter };
