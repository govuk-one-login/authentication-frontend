import { PATH_NAMES } from "../../../app.constants";

import * as express from "express";
import { cookiesGet } from "./cookies-controller";

const router = express.Router();

router.get(PATH_NAMES.COOKIES_POLICY, cookiesGet);

export { router as cookiesRouter };
