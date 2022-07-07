import { PATH_NAMES } from "../../../app.constants";

import * as express from "express";
import { cookiesGet, cookiesPost } from "./cookies-controller";

const router = express.Router();

router.get(PATH_NAMES.COOKIES_POLICY, cookiesGet);

router.post(PATH_NAMES.COOKIES_POLICY, cookiesPost);

export { router as cookiesRouter };
