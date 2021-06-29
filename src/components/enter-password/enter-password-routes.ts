import { PATH_NAMES } from "../../app.constants";

import * as express from "express";
import {
  enterPasswordGet,
  enterPasswordPost,
} from "./enter-password-controller";
import { validateEnterPasswordRequest } from "./enter-password-validation";
import { basicMiddlewarePipeline } from "../../middleware/middleware-pipeline";

const router = express.Router();

router.get(
  PATH_NAMES.ENTER_PASSWORD,
  basicMiddlewarePipeline,
  enterPasswordGet
);

router.post(
  PATH_NAMES.ENTER_PASSWORD,
  basicMiddlewarePipeline,
  validateEnterPasswordRequest(),
  enterPasswordPost()
);

export { router as enterPasswordRouter };
