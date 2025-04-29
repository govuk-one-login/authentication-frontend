import * as express from "express";
import { authorizeGet } from "./authorize-controller.js";
import { PATH_NAMES } from "../../app.constants.js";
const router = express.Router();

router.get(PATH_NAMES.AUTHORIZE, authorizeGet());

export { router as authorizeRouter };
