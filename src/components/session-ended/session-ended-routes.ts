import { PATH_NAMES } from "../../app.constants.js";
import * as express from "express";
import { sessionEndedGet } from "./session-ended-controller.js";

const router = express.Router();

router.get(PATH_NAMES.SESSION_ENDED, sessionEndedGet);

export { router as sessionEndedRouter };
