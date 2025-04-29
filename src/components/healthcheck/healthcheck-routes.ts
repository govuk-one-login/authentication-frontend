import { PATH_NAMES } from "../../app.constants.js";
import * as express from "express";
import { healthcheckGet } from "./healthcheck-controller.js";
const router = express.Router();

router.get(PATH_NAMES.HEALTHCHECK, healthcheckGet);

export { router as healthcheckRouter };
