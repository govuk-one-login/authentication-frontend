import { PATH_NAMES } from "../../app.constants.js";
import * as express from "express";
import { signedOutGet } from "./signed-out-controller.js";
const router = express.Router();

router.get(PATH_NAMES.SIGNED_OUT, signedOutGet);

export { router as signedOutRouter };
