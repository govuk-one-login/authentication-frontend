import * as express from "express";
import { landingGet } from "./landing-controller";
import { asyncHandler } from "../../utils/async";
import { PATH_NAMES } from "../../app.constants";

const router = express.Router();

router.get(PATH_NAMES.START, asyncHandler(landingGet()));

export { router as landingRouter };
