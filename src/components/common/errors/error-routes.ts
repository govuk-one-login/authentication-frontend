import { PATH_NAMES } from "../../../app.constants";
import * as express from "express";
import { validateSessionMiddleware } from "../../../middleware/session-middleware";
import { errorPageGet } from "./error-controller";

const router = express.Router();

router.get(PATH_NAMES.ERROR_PAGE, validateSessionMiddleware, errorPageGet);

export { router as errorPageRouter };
