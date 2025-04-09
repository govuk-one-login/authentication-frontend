import * as express from "express";
import { landingGet } from "./landing-controller.js";
import { PATH_NAMES } from "../../app.constants.js";

const router = express.Router();

router.get(PATH_NAMES.ROOT, landingGet);

export { router as landingRouter };
