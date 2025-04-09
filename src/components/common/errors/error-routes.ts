import { PATH_NAMES } from "../../../app.constants.js";
import * as express from "express";
import { validateSessionMiddleware } from "../../../middleware/session-middleware.js";
import { errorPageGet } from "./error-controller.js";
const router = express.Router();

router.get(PATH_NAMES.ERROR_PAGE, validateSessionMiddleware, errorPageGet);

export { router as errorPageRouter };
