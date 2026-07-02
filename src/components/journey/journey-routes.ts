import * as express from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { validateSessionMiddleware } from "../../middleware/session-middleware.js";
import { journeyGet } from "./journey-controller.js";

const router = express.Router()

router.get(PATH_NAMES.JOURNEY, validateSessionMiddleware, journeyGet);

export { router as journeyRouter }