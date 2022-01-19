import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import { healthcheckGet } from "./healthcheck-controller";

const router = express.Router();

router.get(PATH_NAMES.HEALTHCHECK, healthcheckGet);

export { router as healthcheckRouter };
