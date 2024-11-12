import * as express from "express";
import { asyncHandler } from "../../utils/async";
import { PATH_NAMES } from "../../app.constants";
import { ipvCallbackGet } from "./ipv-callback-controller";

const router = express.Router();

router.get(PATH_NAMES.IPV_CALLBACK, asyncHandler(ipvCallbackGet()));

export { router as ipvCallbackRouter };
