import * as express from "express";
import { authorizeGet } from "./authorize-controller";
import { asyncHandler } from "../../utils/async";
import { PATH_NAMES } from "../../app.constants";

const router = express.Router();

router.get(PATH_NAMES.AUTHORIZE, asyncHandler(authorizeGet()));

export { router as authorizeRouter };
