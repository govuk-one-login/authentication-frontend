import * as express from "express";
import { landingGet } from "./landing-controller";
import { PATH_NAMES } from "../../app.constants";

const router = express.Router();

router.get(PATH_NAMES.ROOT, landingGet);

export { router as landingRouter };
